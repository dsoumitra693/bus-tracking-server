import Redis, { Redis as RedisClient } from "ioredis";
import AppConfig from "../api/app.config";

const appConfig = AppConfig.getInstance();

/**
 * Singleton service for managing cache operations using Redis.
 * 
 * This service provides a cache layer for storing, retrieving, deleting, and invalidating cache entries.
 * It uses the ioredis client for Redis and can manage cache with an optional LRU (Least Recently Used) policy.
 * 
 * @class CacheService
 * @template T The type of data stored in the cache.
 */
export class CacheService<T> {
  private static instance: CacheService<any>;
  private redis: RedisClient;

  /**
   * Private constructor to enforce the Singleton pattern.
   * Initializes the Redis client and configures the LRU eviction policy.
   * 
   * @private
   */
  private constructor() {
    this.redis = new Redis(appConfig.getRedisConfig());
    this.configureLruPolicy();
  }

  /**
   * Configures the LRU eviction policy in Redis based on the application's configuration.
   * This method is called during the initialization of the CacheService.
   * 
   * @private
   * @returns {Promise<void>} Resolves when the LRU policy is successfully configured.
   */
  private async configureLruPolicy(): Promise<void> {
    try {
      const lruConfig = appConfig.getLruConfig();
      for (const [key, value] of Object.entries(lruConfig)) {
        await this.redis.config("SET", key, value);
      }
      console.log("Redis LRU policy configured:", lruConfig);
    } catch (error) {
      console.error("Failed to configure Redis LRU policy:", error);
    }
  }

  /**
   * Singleton accessor for `CacheService`.
   * Ensures only one instance of the service is created and reused.
   * 
   * @returns {CacheService<T>} The singleton instance of the cache service.
   */
  public static getInstance<T>(): CacheService<T> {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance as CacheService<T>;
  }

  /**
   * Retrieves a value from the cache by key.
   * 
   * @param {string} key - The key to retrieve the value for.
   * 
   * @returns {Promise<T | null>} A promise resolving to the cached value, or `null` if not found.
   */
  public async get(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.error(`Failed to get value for key "${key}"`, error);
      return null;
    }
  }

  /**
   * Stores a value in the cache with an optional TTL (Time-To-Live).
   * 
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store in the cache.
   * @param {number} [ttl=3600] - The TTL in seconds for the cache entry (default is 1 hour).
   * 
   * @returns {Promise<void>} Resolves when the value is successfully cached.
   */
  public async put(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      // Set the cache value and expiration time (TTL)
      await this.redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error(`Failed to set value for key "${key}"`, error);
    }
  }

  /**
   * Deletes a cache entry by key.
   * 
   * @param {string} key - The key of the cache entry to delete.
   * 
   * @returns {Promise<void>} Resolves when the cache entry is successfully deleted.
   */
  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Failed to delete key "${key}"`, error);
    }
  }

  /**
   * Clears all entries from the Redis cache.
   * 
   * @returns {Promise<void>} Resolves when the cache is successfully cleared.
   */
  public async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error("Failed to clear cache", error);
    }
  }

  /**
   * Retrieves the current size of the cache (number of keys).
   * 
   * @returns {Promise<number>} A promise resolving to the number of keys in the cache.
   */
  public async size(): Promise<number> {
    try {
      return await this.redis.dbsize();
    } catch (error) {
      console.error("Failed to retrieve cache size", error);
      return 0;
    }
  }

  /**
   * Checks whether a key exists in the cache.
   * 
   * @param {string} key - The key to check for existence.
   * 
   * @returns {Promise<boolean>} A promise resolving to `true` if the key exists, `false` otherwise.
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`Failed to check existence of key "${key}"`, error);
      return false;
    }
  }

  /**
   * Invalidates a cache entry based on a specific event or data change.
   * This method allows the user to manually invalidate a cache entry when data changes.
   * 
   * @param {string} key - The cache key to invalidate.
   * 
   * @returns {Promise<void>} A promise that resolves when the cache is invalidated.
   */
  public async invalidate(key: string): Promise<void> {
    try {
      await this.delete(key);
      console.log(`Cache invalidated for key "${key}"`);
    } catch (error) {
      console.error(`Failed to invalidate cache for key "${key}"`, error);
    }
  }
}

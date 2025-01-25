import dotenv from "dotenv";
import { RedisOptions } from "ioredis";

/**
 * Singleton AppConfig class to manage application configuration, including environment variables and Redis/DB setup.
 * Ensures only one instance of AppConfig exists to manage configuration across the application.
 */
class AppConfig {
  private static instance: AppConfig;  // Singleton instance

  /**
   * Private constructor to enforce the singleton pattern.
   * Loads environment variables from the `.env` file using dotenv.
   */
  private constructor() {
    dotenv.config();  // Load environment variables from .env file
  }

  /**
   * Provides the singleton instance of AppConfig.
   * If an instance doesn't exist, a new one is created.
   *
   * @returns {AppConfig} The singleton instance of AppConfig.
   */
  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * Retrieves the application port from the environment variables.
   * Defaults to 3000 if not defined.
   *
   * @returns {number} The application port.
   */
  public getPort(): number {
    return Number(process.env.PORT) || 3000;  // Default to 3000 if PORT is not defined
  }

  /**
   * Retrieves the Neon DB connection URL from the environment variables.
   * Throws an error if the connection URL is not defined.
   *
   * @throws {Error} If the NEON_DB_URL environment variable is not defined.
   * @returns {string} The Neon DB connection URL.
   */
  public getDBUrl(): string {
    const dbUrl = process.env.NEON_DB_URL;
    if (!dbUrl) {
      throw new Error("NEON_DB_URL is not defined in the environment variables.");
    }
    return dbUrl;
  }

  /**
   * Retrieves the Redis configuration options for `ioredis` from environment variables.
   * Defaults are provided if specific variables are not defined.
   *
   * @returns {RedisOptions} The Redis configuration object.
   */
  public getRedisConfig(): RedisOptions {
    return {
      port: Number(process.env.REDIS_PORT) || 6379,  // Default to 6379 if not defined
      host: process.env.REDIS_HOST || "127.0.0.1",  // Default to localhost if not defined
      username: process.env.REDIS_USERNAME || "",   // Default to empty string if not defined
      password: process.env.REDIS_PASSWORD || "",   // Default to empty string if not defined
    };
  }

  /**
   * Retrieves Redis LRU (Least Recently Used) settings for memory management.
   * Allows configuration of memory size and eviction policy.
   *
   * @returns {Record<string, string>} The LRU settings for Redis.
   */
  public getLruConfig(): Record<string, string> {
    return {
      maxmemory: `${process.env.MAX_LRU_SIZE || 10}mb`,  // Default to 10MB if not defined
      "maxmemory-policy": "allkeys-lru",  // Redis eviction policy
    };
  }

  /**
   * Constant representing the name of the bus data table in the database.
   * This can be used to reference the table in queries or migrations.
   */
  public static BUS_DATA_TABLE = "bus_routes";
}

export default AppConfig;

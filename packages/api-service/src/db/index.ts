import { Pool } from "pg";
import AppConfig from "../api/app.config";

const appConfig = AppConfig.getInstance();

/**
 * Singleton service for managing PostgreSQL database connections and queries.
 * Utilizes the `pg` library's connection pooling for efficient database operations.
 * This service provides methods to query the database and retrieve results with strong typing.
 * 
 * @class DBService
 */
class DBService {
  private static instance: DBService;
  private pool: Pool;

  /**
   * Private constructor to enforce the Singleton pattern.
   * Initializes the PostgreSQL connection pool with SSL enabled for secure connections.
   * 
   * @private
   */
  private constructor() {
    this.pool = new Pool({
      connectionString: appConfig.getDBUrl(), // Neon DB connection string
      ssl: { rejectUnauthorized: false }, // Enable SSL for Neon DB
    });
  }

  /**
   * Singleton accessor for `DBService`.
   * Ensures only one instance of the service is created and reused.
   * 
   * @returns {DBService} The singleton instance of the database service.
   */
  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  /**
   * Executes a parameterized SQL query on the database.
   * This method is designed to execute queries that return multiple rows.
   * 
   * @template T The expected return type of the query result rows.
   * @param {string} queryText - The SQL query string.
   * @param {any[]} [params] - Optional array of query parameters to bind to the query.
   * 
   * @returns {Promise<T>} A promise resolving to an array of result rows of type `T`.
   * 
   * @throws {Error} If the query execution fails, an error will be thrown with a detailed message.
   */
  public async query<T>(queryText: string, params?: any[]): Promise<T> {
    try {
      const result = await this.pool.query(queryText, params);
      return result.rows as T;
    } catch (error) {
      console.error("[DBService] Error executing query:", error);
      throw error;
    }
  }

  /**
   * Executes a query and retrieves a single row from the result.
   * This method is useful for fetching a single row, typically when querying by primary key or other unique fields.
   * 
   * @template T The expected return type of the single result row.
   * @param {string} queryText - The SQL query string.
   * @param {any[]} [params] - Optional array of query parameters to bind to the query.
   * 
   * @returns {Promise<T | null>} A promise resolving to the first row of the result or `null` if no rows are found.
   */
  public async getOne<T>(queryText: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T[]>(queryText, params);
    return rows.length ? rows[0] : null;
  }

  /**
   * Closes the PostgreSQL connection pool.
   * This method should be used during application shutdown to gracefully release database connections.
   * 
   * @returns {Promise<void>} A promise that resolves once the connection pool has been closed.
   */
  public async close(): Promise<void> {
    await this.pool.end();
    console.log("[DBService] Database connection pool has been closed.");
  }
}

export default DBService;

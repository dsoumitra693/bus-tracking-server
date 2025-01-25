import DBService from "../db";

const dbServiceInstance = DBService.getInstance();

/**
 * A generic repository class that interacts with database tables.
 * Provides basic CRUD operations (Create, Read, Update, Delete) and can be extended for more specific queries.
 * This class follows the Singleton pattern to ensure only one instance per table.
 *
 * @template T The type representing the structure of a row in the database table.
 */
class DBRepository<T> {
  private static instances: Map<string, DBRepository<any>> = new Map();
  private tableName: string;

  /**
   * Initializes the repository with a specific table name.
   * This constructor is private to enforce Singleton pattern.
   *
   * @param {string} tableName - The name of the database table to interact with.
   */
  private constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Singleton accessor for DBRepository.
   * Ensures only one instance of DBRepository is created for each table.
   *
   * @param {string} tableName - The name of the database table.
   * @returns {DBRepository<T>} The singleton instance of DBRepository for the specified table.
   *
   * @example
   * // Access the singleton instance of DBRepository for a table called 'users'
   * const userRepository = DBRepository.getInstance<User>('users');
   */
  public static getInstance<T>(tableName: string): DBRepository<T> {
    if (!this.instances.has(tableName)) {
      this.instances.set(tableName, new DBRepository<T>(tableName));
    }
    return this.instances.get(tableName)!;
  }

  /**
   * Fetches all rows from the table with pagination support.
   *
   * @param {Object} params - Pagination parameters.
   * @param {number} params.limit - The number of rows to fetch.
   * @param {number} params.offset - The offset for pagination.
   * @returns {Promise<T[]>} A promise resolving to an array of rows of type `T`.
   *
   * @example
   * // Fetch the first 10 users
   * const users = await userRepository.getAll({ limit: 10, offset: 0 });
   */
  public async getAll({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`;
    return dbServiceInstance.query<T[]>(query, [limit, offset]);
  }

  /**
   * Fetches a single row by its ID.
   *
   * @param {number | string} id - The ID of the row to fetch.
   * @returns {Promise<T | null>} A promise resolving to the row of type `T` or `null` if not found.
   *
   * @example
   * // Fetch a user by ID
   * const user = await userRepository.getById(1);
   */
  public async getById(id: number | string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    return dbServiceInstance.getOne<T>(query, [id]);
  }

  /**
   * Fetches a single row by a specific route number.
   *
   * @param {number | string} route_no - The route number to query by.
   * @returns {Promise<T | null>} A promise resolving to the row of type `T` or `null` if not found.
   *
   * @example
   * // Fetch a route by route number
   * const route = await routeRepository.getByRouteNo('A123');
   */
  public async getByRouteNo(route_no: number | string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE route_no = $1`;
    return dbServiceInstance.getOne<T>(query, [route_no]);
  }

  /**
   * Inserts a new row into the table.
   *
   * @param {Partial<T>} data - The data to insert, containing column-value pairs.
   * @returns {Promise<T>} A promise resolving to the newly created row.
   *
   * @example
   * // Insert a new user
   * const newUser = await userRepository.create({ name: 'John Doe', email: 'john@example.com' });
   */
  public async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders}) RETURNING *`;
    const result = await dbServiceInstance.query<T[]>(query, values);
    return result[0];
  }

  /**
   * Updates an existing row by its ID.
   *
   * @param {number | string} id - The ID of the row to update.
   * @param {Partial<T>} data - The data to update, containing column-value pairs.
   * @returns {Promise<T | null>} A promise resolving to the updated row of type `T` or `null` if not found.
   *
   * @example
   * // Update a user's email by ID
   * const updatedUser = await userRepository.update(1, { email: 'new-email@example.com' });
   */
  public async update(
    id: number | string,
    data: Partial<T>
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const updates = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const query = `UPDATE ${this.tableName} SET ${updates} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await dbServiceInstance.query<T[]>(query, [...values, id]);
    return result[0] || null;
  }

  /**
   * Deletes a row by its ID.
   *
   * @param {number | string} id - The ID of the row to delete.
   * @returns {Promise<boolean>} A promise resolving to `true` if the row was deleted, otherwise `false`.
   *
   * @example
   * // Delete a user by ID
   * const isDeleted = await userRepository.delete(1);
   */
  public async delete(id: number | string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await dbServiceInstance.query<{ affectedRows: number }[]>(
      query,
      [id]
    );
    return result.length > 0 && result[0].affectedRows > 0;
  }
}

export default DBRepository;

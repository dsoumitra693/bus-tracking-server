import { Request, Response, NextFunction } from "express";
import { CacheService } from "../cache";
import DBRepository from "../repo";
import AppConfig from "./app.config";

/**
 * ApiController handles the logic for processing API requests related to bus details.
 * It follows a Singleton pattern and provides an API endpoint to get bus details by its ID or route_number.
 */
export class ApiController {
  private static instance: ApiController;
  private cacheService: CacheService<any>;
  private dbRepo: DBRepository<any>;

  /**
   * Private constructor to ensure Singleton pattern.
   * Initializes the CacheService and DBRepository.
   */
  private constructor() {
    this.cacheService = CacheService.getInstance<any>();
    this.dbRepo = DBRepository.getInstance(AppConfig.BUS_DATA_TABLE);
  }

  /**
   * Singleton accessor for ApiController.
   * This method ensures only one instance of the ApiController is created.
   *
   * @returns {ApiController} The singleton instance of ApiController.
   */
  public static getInstance(): ApiController {
    if (!ApiController.instance) {
      ApiController.instance = new ApiController();
    }
    return ApiController.instance;
  }

  /**
   * Handles GET requests to retrieve bus details based on the provided bus ID or route_number.
   * The method first attempts to fetch data from the cache, and if not found, retrieves it from the database.
   *
   * @param {Request} req - The request object, which can include the bus ID or route_number as a parameter.
   * @param {Response} res - The response object, used to send the bus details or error response.
   * @param {NextFunction} next - The next middleware function, used for error handling.
   *
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async getBusDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, route_number } = req.query;

      // Validate if either bus ID or route number is provided
      if (!id && !route_number) {
        res.status(400).json({
          success: false,
          message: "Either Bus ID or Route Number is required",
          data: null,
        });
        return;
      }

      // Build query conditions based on provided parameters
      const query = id
        ? { id: String(id) }
        : { route_number: String(route_number) };

      // Attempt to fetch the bus details from the cache
      const cachedBusDetails = await this.cacheService.get(
        JSON.stringify(query)
      );

      if (cachedBusDetails) {
        res.status(200).json({
          success: true,
          message: "Bus details retrieved from cache",
          data: cachedBusDetails,
        });
        return;
      }

      // Fetch bus details from the database if not found in cache
      const busDetails = await this.fetchBusDetails(query);

      // Cache the fetched bus details for future requests
      await this.cacheService.put(JSON.stringify(query), busDetails);

      res.status(200).json({
        success: true,
        message: "Bus details retrieved successfully",
        data: busDetails,
      });
    } catch (error) {
      // Pass errors to the next middleware (error handler)
      next(error);
    }
  }

  /**
   * Fetch bus details from the database repository.
   * This method handles the logic of retrieving bus details by its ID or route_number from the database.
   *
   * @param {object} query - The query object containing either `id` or `route_number`.
   *
   * @returns {Promise<any>} A promise that resolves with the bus details.
   * @throws {Error} If no bus is found in the database.
   */
  private async fetchBusDetails(query: {
    id?: string | number;
    route_number?: string;
  }): Promise<any> {
    try {
      let busDetails;
      if (!!query.id) {
        busDetails = this.dbRepo.getById(query.id);
      } else if (!!query.route_number) {
        busDetails = this.dbRepo.getByRouteNo(query.route_number);
      }

      // If no bus is found, throw an error
      if (!busDetails) {
        throw new Error("Bus details not found");
      }

      return busDetails;
    } catch (error) {
      console.error("Failed to fetch bus details from database:", error);
      throw error; // Rethrow error for further handling
    }
  }

  /**
   * Handles GET requests to retrieve a paginated list of all bus details.
   * Supports pagination with limit and offset.
   *
   * @param {Request} req - The request object, which includes pagination parameters (limit and offset).
   * @param {Response} res - The response object, used to send the bus details or error response.
   * @param {NextFunction} next - The next middleware function, used for error handling.
   *
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async getAllBusDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const busDetails = await this.dbRepo.getAll({
        limit: Number(limit),
        offset: Number(offset),
      });

      res.status(200).json({
        success: true,
        message: "All bus details retrieved successfully",
        data: busDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles PUT requests to update bus details based on the provided bus ID.
   * The method invalidates the cache if the bus details are successfully updated.
   *
   * @param {Request} req - The request object, which includes the bus ID and the new data to update.
   * @param {Response} res - The response object, used to send the updated bus details or error response.
   * @param {NextFunction} next - The next middleware function, used for error handling.
   *
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async updateBusDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const busDetails = req.body;

      // Validate if the bus ID is provided
      if (!id || !busDetails) {
        res.status(400).json({
          success: false,
          message: "Bus ID and new data are required",
          data: null,
        });
        return;
      }

      const updatedBus = await this.dbRepo.update(id, busDetails);

      if (!updatedBus) {
        res.status(404).json({
          success: false,
          message: "Bus details not found",
          data: null,
        });
        return;
      }

      // Invalidate the cache for the updated bus details
      const query = { id: String(id) };
      await this.cacheService.invalidate(JSON.stringify(query));

      res.status(200).json({
        success: true,
        message: "Bus details updated successfully",
        data: updatedBus,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles DELETE requests to remove bus details based on the provided bus ID.
   * The method invalidates the cache if the bus details are successfully deleted.
   *
   * @param {Request} req - The request object, which includes the bus ID to be deleted.
   * @param {Response} res - The response object, used to send the success or error response.
   * @param {NextFunction} next - The next middleware function, used for error handling.
   *
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  public async deleteBusDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate if the bus ID is provided
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bus ID is required",
          data: null,
        });
        return;
      }

      const deletedBus = await this.dbRepo.delete(id);

      if (!deletedBus) {
        res.status(404).json({
          success: false,
          message: "Bus details not found",
          data: null,
        });
        return;
      }

      // Invalidate the cache for the deleted bus details
      const query = { id: String(id) };
      await this.cacheService.invalidate(JSON.stringify(query));

      res.status(200).json({
        success: true,
        message: "Bus details deleted successfully",
        data: deletedBus,
      });
    } catch (error) {
      next(error);
    }
  }
}

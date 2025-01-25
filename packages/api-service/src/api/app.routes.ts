import { Router } from "express";
import { ApiController } from "./app.controller";

/**
 * Singleton ApiRouter class to define versioned API routes.
 * This class ensures that only one instance of the router is created and routes are initialized once.
 */
class ApiRouter {
  private static instance: ApiRouter;  // Singleton instance
  private router: Router;  // Express router to define API routes

  /**
   * Private constructor to enforce the singleton pattern and initialize the routes.
   * The constructor initializes the router and sets up all the versioned API routes.
   */
  private constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Provides the singleton instance of the ApiRouter.
   * If an instance doesn't exist, a new one is created. This method ensures that 
   * only a single instance of the router exists throughout the application.
   *
   * @returns {ApiRouter} The singleton instance of ApiRouter.
   */
  public static getInstance(): ApiRouter {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter();
    }
    return ApiRouter.instance;
  }

  /**
   * Initializes the routes for the API with versioning.
   * This method maps routes to corresponding controller methods. The routes 
   * handle bus-related requests, including fetching, updating, and deleting bus details.
   * The routes are versioned with `/v1`.
   */
  private initializeRoutes(): void {
    const apiController = ApiController.getInstance();  // Get the singleton instance of ApiController

    // Versioned routes for bus details
    this.router.get("/v1/bus/details", apiController.getBusDetails.bind(apiController));  // Get bus details by ID or route number
    this.router.get("/v1/bus", apiController.getAllBusDetails.bind(apiController));          // Get all bus details with pagination
    this.router.put("/v1/bus/:id", apiController.updateBusDetails.bind(apiController));      // Update bus details by ID
    this.router.delete("/v1/bus/:id", apiController.deleteBusDetails.bind(apiController));   // Delete bus details by ID
  }

  /**
   * Provides the Express Router instance containing all the API routes.
   * This method returns the router that contains all the versioned routes for bus-related endpoints.
   *
   * @returns {Router} The Express Router instance with defined routes.
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default ApiRouter;

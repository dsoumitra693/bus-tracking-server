import express, { Express } from "express";
import ApiRouter from "./app.routes";
import AppConfig from "./app.config";

const appConfig = AppConfig.getInstance();

/**
 * Singleton AppServer class to set up and manage the Express application.
 * This class handles the setup of middleware, routes, and server initialization.
 */
class AppServer {
  private static instance: AppServer;  // Singleton instance
  private app: Express;  // Express application instance

  /**
   * Private constructor to enforce the singleton pattern and set up the application.
   * Initializes the Express app, configures middleware, and sets up routes.
   * This constructor is called only once to ensure a single instance of the server.
   */
  private constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Provides the singleton instance of the AppServer.
   * If an instance doesn't exist, a new one is created.
   * This method ensures that only one instance of the server is used throughout the application.
   *
   * @returns {AppServer} The singleton instance of AppServer.
   */
  public static getInstance(): AppServer {
    if (!AppServer.instance) {
      AppServer.instance = new AppServer();
    }
    return AppServer.instance;
  }

  /**
   * Configures middleware for the Express app.
   * This includes parsing JSON and URL-encoded request bodies for incoming requests.
   * Middleware is applied globally to all incoming requests to the server.
   */
  private setupMiddleware(): void {
    this.app.use(express.json());  // Middleware to parse JSON request bodies
    this.app.use(express.urlencoded({ extended: true }));  // Middleware to parse URL-encoded request bodies
  }

  /**
   * Sets up the routes for the API.
   * Routes are prefixed with '/api/v1' and are managed by ApiRouter.
   * This method ensures the routes are properly defined and grouped under the '/api/v1' prefix.
   */
  private setupRoutes(): void {
    this.app.use("/api/v1", ApiRouter.getInstance().getRouter());  // Use ApiRouter for '/api/v1' routes
  }

  /**
   * Starts the server and listens on the specified port.
   * The port is retrieved from the app's configuration.
   * Upon successful startup, the server URL is logged to the console.
   */
  public start(): void {
    const port = appConfig.getPort();  // Get the port from the configuration
    this.app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  }
}

export default AppServer;

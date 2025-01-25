import AppServer from "./api/app.server";

/**
 * Initializes and starts the Express server.
 * 
 * The AppServer is created using the singleton pattern to ensure only one instance 
 * of the server is used throughout the application. The server is then started 
 * by listening on the port defined in the configuration.
 * 
 * @example
 * // Create and start the server instance
 * const appServer = AppServer.getInstance();  // Get the singleton instance of AppServer
 * appServer.start();  // Start the server by listening on the configured port
 */
const appServer = AppServer.getInstance();  // Get the singleton instance of AppServer

/**
 * Starts the Express server by calling the `start` method on the `appServer` instance.
 * This listens for incoming requests on the configured port and sets up necessary
 * middleware and routes for the application to function.
 */
appServer.start();  // Start the server by listening on the configured port

---

# Bus Tracking Server

This project is a bus tracking API server built with Node.js, Express, Redis, and PostgreSQL. The server tracks bus routes, bus details, and integrates with Redis for caching. It is designed to run in a Docker-based environment and is part of a monorepo with multiple packages and services.

---

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Docker Setup](#docker-setup)
7. [API Endpoints](#api-endpoints)
8. [Development](#development)
9. [License](#license)

---

## Technologies Used

- **Node.js** - Server-side JavaScript runtime
- **Express** - Web framework for Node.js
- **Redis** - In-memory data store used for caching bus details
- **PostgreSQL** - Database used to store bus routes and details
- **Docker** - Containerization for development and production environments
- **TypeScript** - JavaScript superset for type safety
- **ioredis** - Redis client for Node.js
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Manage environment variables
- **Nodemon** - Development tool to automatically restart the server on file changes

---

## Project Structure

This is a monorepo structure with multiple services:

```
.
├── docs/                    # Documentation files
├── packages/                # Contains multiple services
│   └── api-service/         # API service for bus tracking
├── .gitignore
├── docker-compose.yml       # Docker configuration
└── package.json             # Monorepo configuration
```

- `packages/api-service`: Contains the main API server code that handles bus tracking logic.
- `docker-compose.yml`: Docker configuration for running services like Redis and the API server.
- `package.json`: Root configuration for the monorepo and managing workspaces.

---

## Installation

To get started, you'll need to clone the repository and install dependencies.

### Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### Install dependencies

Run the following command to install all dependencies in the monorepo:

```bash
npm install
```

This will install the dependencies for both the root project and all packages inside the `packages` folder.

---

## Environment Configuration

Create a `.env` file in the root of your project to define the environment variables required for the application to run. Example:

```env
PORT=3000
NEON_DB_URL=your_neon_db_connection_url
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

Ensure that `NEON_DB_URL` points to your PostgreSQL database, and `REDIS_PASSWORD` matches the Redis password.

---

## Running the Application

To run the application in a Docker environment, you can use the following command:

```bash
npm start
```

This will build and start the Docker containers as defined in `docker-compose.yml`.

---

## Docker Setup

### Services

This project uses Docker Compose to manage services:

1. **Cache (Redis)**: A Redis container for caching bus details.
2. **API Server**: The main bus tracking API server built with Express.

### Commands

To start the services using Docker Compose, use:

```bash
docker-compose up --build
```

This will build and start the containers defined in `docker-compose.yml`.

---

## API Endpoints

The following API endpoints are available:

- **GET /v1/bus/details**: Get details of a specific bus by ID or route number.
- **GET /v1/bus**: Get all bus details with pagination.
- **PUT /v1/bus/:id**: Update bus details by ID.
- **DELETE /v1/bus/:id**: Delete bus details by ID.

The API version is prefixed as `/v1` for future versioning.

---

## Development

For local development, you can use `nodemon` to automatically restart the server when you make changes:

1. Navigate to the API service directory:

```bash
cd packages/api-service
```

2. Run the development server:

```bash
npm run dev
```

This will start the server with `nodemon` and automatically reload the server on code changes.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### Notes:
- Ensure that you have Docker and Docker Compose installed on your machine to build and run the containers.
- For security purposes, avoid hardcoding sensitive information like passwords in code. Use Docker secrets or environment variables instead.

---
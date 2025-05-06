## Project Overview

This is a NestJS backend service designed to interact with the PokeAPI. It provides endpoints to retrieve Pokémon data and their images, utilizing caching mechanisms for performance optimization and scheduled tasks for potential background operations.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [Redis](https://redis.io/) (if using Redis for caching, ensure it's running and accessible)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Application

*   **Development Mode (with watch):**
    ```bash
    npm run start:dev
    ```
    The application will start on the port specified by the `PORT` environment variable (defaulting to 3000) and automatically restart on file changes.

*   **Production Mode:**
    First, build the application:
    ```bash
    npm run build
    ```
    Then, start the application:
    ```bash
    npm run start:prod
    ```

*   **Debugging Mode:**
    ```bash
    npm run start:debug
    ```

## Running Tests

*   **Unit Tests:**
    ```bash
    npm run test
    ```
    To run in watch mode:
    ```bash
    npm run test:watch
    ```
    To generate coverage report:
    ```bash
    npm run test:cov
    ```

*   **End-to-End (E2E) Tests:**
    ```bash
    npm run test:e2e
    ```

## Linting and Formatting

*   **Linting:** Check for code style issues and potential errors.
    ```bash
    npm run lint
    ```
    This command will also attempt to fix fixable issues.

*   **Formatting:** Format the code using Prettier.
    ```bash
    npm run format
    ```

## Project Structure

```
.
├── dist/                               # Compiled JavaScript code (after build)
├── docs/                               # Project documentation
│   └── README.md                       # This file
├── node_modules/                       # Project dependencies
├── src/                                # Source code
│   ├── app.module.ts                   # Root application module
│   ├── main.ts                         # Application entry point
│   ├── pokeapi/                        # Module for interacting with PokeAPI
│   │   ├── pokeapi.interfaces.ts       # Interfaces for PokeAPI data
│   │   ├── pokeapi.service.spec.ts     # Unit tests for PokeapiService
│   │   └── pokeapi.service.ts          # Service for PokeAPI calls
│   ├── pokemon/                        # Module for Pokémon features
│   │   ├── pokemon.controller.spec.ts  # Unit tests for PokemonController
│   │   ├── pokemon.controller.ts       # Controller handling Pokémon API requests
│   │   ├── pokemon.service.spec.ts     # Unit tests for PokemonService
│   │   └── pokemon.service.ts          # Service for Pokémon business logic
│   └── tasks/                          # Module for scheduled tasks
│       └── tasks.service.ts            # Service containing scheduled jobs
├── test/                               # End-to-end tests
│   ├── app.e2e-spec.ts                 # Main E2E test file
│   └── jest-e2e.json                   # Jest configuration for E2E tests
├── .eslintrc.js                        # ESLint configuration
├── .prettierrc                         # Prettier configuration (if present)
├── nest-cli.json                       # NestJS CLI configuration
├── package.json                        # Project metadata and dependencies
├── README.md                           # Top-level README (consider adding a link here to docs/README.md)
├── tsconfig.build.json                 # TypeScript configuration for building
└── tsconfig.json                       # Base TypeScript configuration
```

## API Endpoints

The service exposes the following endpoints under the `/pokemon` route:

*   **`GET /pokemon`**: Retrieves a list of Pokémon.
    *   Query Parameters:
        *   `limit` (number, optional, default: 10): Number of Pokémon to retrieve.
        *   `offset` (number, optional, default: 0): Number of Pokémon to skip.
    *   Response: An array of Pokémon summary objects.

*   **`GET /pokemon/:id`**: Retrieves detailed information for a specific Pokémon by its ID or name.
    *   Path Parameter:
        *   `id` (string): The ID or name of the Pokémon.
    *   Response: A detailed Pokémon object.

*   **`GET /pokemon/:id/front-image`**: Retrieves the front sprite image for a specific Pokémon.
    *   Path Parameter:
        *   `id` (string): The ID or name of the Pokémon.
    *   Response: A PNG image file.

*   **`GET /pokemon/:id/back-image`**: Retrieves the back sprite image for a specific Pokémon.
    *   Path Parameter:
        *   `id` (string): The ID or name of the Pokémon.
    *   Response: A PNG image file.

## Caching

The application utilizes a multi-layer caching strategy configured in `app.module.ts`:

1.  **In-Memory Cache:** A fast, short-term cache (`CacheableMemory`) with a Time-To-Live (TTL) of 5 hours.
2.  **Redis Cache:** A persistent cache using Redis, configured via the `REDIS_URL` environment variable.

Requests for Pokémon data and images are cached to reduce load on the external PokeAPI and improve response times. The `CacheModule` from `@nestjs/cache-manager` and `@keyv/redis` are used for implementation.

## Scheduled Tasks

The `TasksService` (`src/tasks/tasks.service.ts`) uses the `@nestjs/schedule` module. Currently, it includes a task to pre-warm the cache by fetching the all Pokémon on application startup.

## Environment Variables

The following environment variables can be configured

*   `PORT`: The port number the application will listen on (default: `3000`).
*   `REDIS_URL`: The connection URL for the Redis instance (e.g., `redis://localhost:6379`).
*   `POKEAPI_BASE_URL`: Base URL for the PokeApi
*   `API_URL`: The API url.
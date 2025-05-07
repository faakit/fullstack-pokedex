# Pokédex Web Application

A modern and interactive Pokemon catalog application built with React, TypeScript, and TailwindCSS. This web application fetches Pokemon data from a locally running API and presents it in a user-friendly interface with infinite scrolling.

![Pokédex Application](https://via.placeholder.com/800x400?text=Pokédex+Application)

## Features

- **Interactive Pokemon Cards**: Displays Pokemon with their images, names, and types
- **Infinite Scrolling**: Automatically loads more Pokemon as you scroll
- **Detailed Pokemon View**: Click on any Pokemon card to see detailed information in a modal
- **Responsive Design**: Works on various screen sizes from mobile to desktop
- **Type Color Coding**: Pokemon types are color-coded for easy identification
- **Loading States**: Visual feedback during data loading operations

## Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - TailwindCSS 3 (for styling)
  - Zustand (for state management)
  - React Intersection Observer (for infinite scrolling)
  - Vite (build tool)
- **Development Tools**:
  - ESLint & Prettier (code quality & formatting)
  - Vitest & Testing Library (testing)
  - TypeScript (type checking)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running on http://localhost:3000

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to http://localhost:5173

## API Integration

This application connects to a Pokemon API running locally on port 3000. The API should provide the following endpoints:

- `GET /pokemon` - List Pokemon with pagination (query parameters: limit, offset)
- `GET /pokemon/:nameOrId` - Get detailed information about a specific Pokemon
- `GET /pokemon/:nameOrId/front-image` - Get the front image of a Pokemon
- `GET /pokemon/:nameOrId/back-image` - Get the back image of a Pokemon

## Project Structure

```
/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Application assets
│   ├── components/             # React components
│   │   ├── PokemonCard.tsx     # Individual Pokemon card component
│   │   └── PokemonModal.tsx    # Modal for detailed Pokemon view
│   ├── hooks/
│   │   └── usePokemonStore.ts  # Zustand store for Pokemon data
│   ├── services/
│   │   └── pokemonApi.ts       # API service to fetch Pokemon data
│   ├── utils/
│   │   └── index.ts            # Utility functions
│   ├── App.tsx                 # Main application component
│   └── index.tsx               # Application entry point
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── tailwind.config.mjs         # TailwindCSS configuration
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run serve` - Preview the production build locally
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Lint the code
- `npm run typecheck` - Check TypeScript types

# Steam Deals Aggregator Blueprint

## Overview

This is a web-based curation service that provides a clean and intuitive interface for discovering the latest Steam game deals. It leverages a server-side API route to fetch and process data from the CheapShark API before presenting it to the user. This architecture simplifies the client-side logic and resolves cross-origin issues.

## Core Architecture: Backend-for-Frontend (BFF)

The project uses a Backend-for-Frontend pattern by implementing a server-side API route at `/api/deals`. This route acts as a dedicated backend for the client application.

-   **Server-Side Data Aggregation (`pages/api/deals.js`)**: 
    1.  Fetches deals, game details, and genre information from multiple CheapShark API endpoints.
    2.  Merges this data into a comprehensive data structure.
    3.  Calculates a `popularityScore` for each game.
    4.  Sends the processed `games` and `genres` data to the client in a single, optimized response.

-   **Client-Side Fetching (`main.js`)**:
    1.  Makes a single request to the local `/api/deals` endpoint.
    2.  Receives the pre-processed data and renders the UI.
    3.  This eliminates the need for CORS workarounds (like proxies) and simplifies client-side state management.

## Core Features & Design

- **Live Data via Server API**: The client fetches all its data from the `/api/deals` route.
- **Dynamic Genre Filtering**: Users can filter the deal list by genre.
- **"Lowest Price Ever" Badge**: A "🏆 역대 최저가!" badge highlights games at their historical lowest price.
- **Curated Sections**: `Ending Soon`, `High Discount`, `Popular Deals`, and `All Games` are rendered based on the data from the server.
- **Auto-Refresh**: The client re-fetches data from the `/api/deals` endpoint every 60 seconds to keep the deals fresh.
- **Direct Steam Integration**: Clicking a card opens the Steam store page.

## Current Task: Refactor to Server-Side Data Fetching

This task involved a major architectural refactoring from a client-side data fetching model to a Backend-for-Frontend (BFF) model. This was done to fundamentally resolve CORS issues and improve maintainability.

1.  **API Route Creation (`pages/api/deals.js`)**:
    -   A new serverless function was created to handle all interactions with the external CheapShark API.
    -   This server-side code is responsible for fetching deals, game details, and genres, then merging them. It also calculates the `popularityScore` for each game, offloading this work from the client.

2.  **Client Refactoring (`main.js`)**:
    -   Removed all direct calls to the CheapShark API and the CORS proxy URL.
    -   The `fetchAndPrepareData` function was simplified to make a single call to `/api/deals`.
    -   The client-side `calculatePopularity` function was removed as this logic now resides on the server.
    -   The periodic refresh now calls `fetchAndPrepareData` to get a completely new dataset from the server.

3.  **Documentation (`blueprint.md`)**: This document has been rewritten to reflect the new BFF architecture, detailing the responsibilities of the client and the server-side API route.
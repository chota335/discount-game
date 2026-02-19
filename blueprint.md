# Project Blueprint

## Overview

This project is a web application that displays a collection of discounted games from Steam. Users can filter the games by category, search for specific games, and view details for each game, with data being fetched from a live API.

## Implemented Features

### Initial Version
- **UI/UX:**
  - A simple, dark-themed interface inspired by the Steam store.
  - Game cards that display the game's image, name, price, and discount.
  - Category buttons for filtering games.
- **Functionality:**
  - Dynamic display of game cards from a JavaScript array.
  - Filtering of games based on category buttons.
- **Code Structure:**
  - Separated HTML, CSS, and JavaScript files.

### Search and API Integration
- **Search Functionality:**
  - Added a search bar to allow users to search for games by name.
- **Real-time Data Integration:**
  - Used the free and legal CheapShark API to fetch real-time game deals.
- **UI/UX Enhancement:**
  - Redesigned game cards to be more visually appealing and informative, displaying image, title, original price, discounted price, and discount percentage.
  - Cards are clickable and lead to the Steam store page.

### Sorting
- **Sorting Functionality:**
  - Added a dropdown menu to sort games by discount, price, or name.
  - Sorting logic works in conjunction with the search filter.

### Localization
- **Currency and Language:**
  - Converted all prices from USD to KRW using a fixed exchange rate.
  - Ensured all user-facing text is in Korean.

## Current Plan

- **Add Genre Information and Optimize Performance:**
  - **Display Genre:** Modify the game cards to display genre information.
  - **Performance Optimization:**
    - The API requires a separate request for each game's genre. To prevent slow loading, all genre requests will be executed in parallel using `Promise.all`.
    - The enriched game data (including genres) will be constructed by combining results from two different API endpoints.
  - **Improve User Experience:**
    - Add a loading spinner to `index.html` that is displayed while the initial data and all genre details are being fetched.
    - Update `style.css` to style the new genre tags and the loading spinner.
    - Refactor `main.js` to handle the new, more complex data fetching logic and to display the genres on the game cards.

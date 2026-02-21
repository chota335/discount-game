
# **Blueprint: Game Deals Website**

## **1. Project Overview**

This project is a web application designed to showcase the latest game deals from the Steam store. It fetches data from the CheapShark API and presents it in a visually appealing and user-friendly interface. The core goal is to provide gamers with a quick and easy way to discover current discounts on PC games.

The application is built using modern, framework-less web technologies (HTML, CSS, JavaScript) and emphasizes a clean, responsive, and aesthetically pleasing design following the "Glassmorphism" trend.

## **2. Core Features & Design (Current Version)**

This section documents all features, styles, and design elements implemented in the application from its initial version to the present.

### **Visual Design & Layout**

*   **Aesthetics:** Modern, clean, and visually engaging "Glassmorphism" design.
*   **Background:** A dark, multi-layered linear gradient (`#0f1722` to `#111827`) with a subtle noise texture for a premium feel.
*   **Layout:** A responsive grid layout (`display: grid`) that adapts automatically to different screen sizes (`repeat(auto-fill, minmax(240px, 1fr))`).
*   **Game Cards:**
    *   **Glass Effect:** Translucent background (`background: rgba(255,255,255,0.05)`) with a `backdrop-filter: blur(10px)` to create a frosted glass appearance.
    *   **Rounded Corners:** Smooth, modern look with `border-radius: 18px`.
    *   **Depth & Shadow:** A soft `box-shadow` that intensifies on hover, making the card appear "lifted."
    *   **Interactivity:** A subtle `transform` effect on hover (`translateY(-10px) scale(1.03)`) provides satisfying feedback.
*   **Typography:** Clean and readable 'Segoe UI', with clear font hierarchy for the header and card information.

### **Functionality**

*   **API Integration:** Fetches a list of the top 40 game deals from the CheapShark API (`https://www.cheapshark.com/api/1.0/deals`).
*   **Dynamic Rendering:** Game deals are dynamically rendered into game cards using JavaScript.
*   **Image Handling:**
    *   Displays high-quality header images directly from Steam's CDN for a polished look (`https://cdn.cloudflare.steamstatic.com/steam/apps/{steamAppID}/header.jpg`).
    *   Includes a fallback to a lower-quality thumbnail (`game.thumb`) if the Steam App ID is unavailable, ensuring no broken images.
    *   Images maintain their correct aspect ratio (`height: auto`) to prevent distortion.
*   **Deal Information:**
    *   **Discount Badge:** A prominent, gradient-colored badge shows the percentage discount.
    *   **"HOT" Badge:** Games with a discount of over 70% are highlighted with a special "HOT" badge.
    *   **Pricing:** Clearly displays the sale price and the original price (with a strikethrough).
*   **External Linking:** Clicking on a game card opens the deal page on CheapShark in a new tab.
*   **Loading State:** A "Loading..." message is displayed while the API data is being fetched.

---

## **3. Current Task: Implement Real-time Search**

This section outlines the plan and steps for the current requested change: adding a real-time search functionality.

### **Plan & Actionable Steps**

1.  **Modify `index.html`:**
    *   Add an `<input>` element within the `<header>` to serve as the search bar.
    *   Assign it a unique ID (e.g., `searchInput`) for easy access in JavaScript.

2.  **Style with `style.css`:**
    *   Style the new search input to match the existing Glassmorphism design.
    *   Ensure it is centered, has appropriate padding, border-radius, and colors.
    *   Add placeholder text styling to guide the user.

3.  **Implement Logic in `main.js`:**
    *   Get a reference to the `searchInput` element.
    *   Add an `input` event listener to the search bar.
    *   Inside the event handler:
        *   Get the user's search query (and convert it to lowercase for case-insensitive matching).
        *   Filter the master `gamesData` array based on whether the game's title (also converted to lowercase) includes the search query.
        *   Create a new function or modify `renderGames` to accept a list of games to render. Call this function with the filtered list.
    *   Ensure that if the search bar is empty, the full list of games is displayed.


# **Blueprint: Game Deals Website**

## **1. Project Overview**

This project is a web application designed to showcase the latest game deals from the Steam store. It fetches data from the CheapShark API and presents it in a visually appealing and user-friendly interface. The core goal is to provide gamers with a quick and easy way to discover current discounts on PC games, while also gathering analytics on which deals are most popular.

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
*   **Search Bar:**
    *   A beautifully styled search input that matches the Glassmorphism theme.
    *   Features a glowing `box-shadow` on focus to draw the user's attention.
*   **Typography:** Clean and readable 'Segoe UI', with clear font hierarchy for the header and card information.

### **Functionality**

*   **API Integration:** Fetches a list of the top 100 game deals from the CheapShark API, sorted by "Deal Rating" for the best value (`pageSize=100&sortBy=Deal Rating`).
*   **Real-time Search:**
    *   Users can type in a search bar to instantly filter the displayed game deals.
    *   The search is case-insensitive and updates the view in real-time.
    *   A message is displayed if no games match the search criteria.
*   **Dynamic Rendering:** Game deals are dynamically rendered into game cards using JavaScript.
*   **Image Handling:**
    *   Displays high-quality header images directly from Steam's CDN.
    *   Includes a fallback to a thumbnail if the Steam App ID is unavailable, ensuring no broken images.
*   **Deal Information:**
    *   **Discount Badge:** A prominent, gradient-colored badge shows the percentage discount.
    *   **"HOT" Badge:** Games with a discount of over 70% are highlighted with a special "HOT" badge.
    *   **Pricing:** Clearly displays the sale price and the original price (with a strikethrough).
*   **External Linking:** Clicking on a game card opens the deal page on CheapShark in a new tab.
*   **Click-Through Analytics:**
    *   Integrates a serverless function (`/functions/track-click`) built for Cloudflare's edge network.
    *   When a user clicks a game card, a `fetch` request is sent to this function in the background.
    *   The function records the `dealID` and increments a counter in a Cloudflare KV store (`CLICKS`), providing valuable data on deal popularity without impacting user experience.

---

## **3. Current Task: Deploy to Production**

This section outlines the plan for deploying the application to a production environment, making it accessible to the public.

### **Plan & Actionable Steps**

1.  **Commit Changes:** Ensure all new features (Click-Through Analytics) are committed to the Git repository.
2.  **Deploy to Cloudflare Pages:** Utilize Cloudflare Pages for a seamless, scalable, and performant deployment.
3.  **Verify:** Once deployed, test all functionalities, including the API fetch, search, and click tracking, to ensure everything is working as expected.

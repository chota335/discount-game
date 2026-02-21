const fs = require("fs");
const https = require("https");

const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60";

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const parsed = JSON.parse(data).map(game => ({
        // Your requested fields
        title: game.title,
        steamAppID: game.steamAppID,
        thumb: game.thumb,
        salePrice: Number(game.salePrice),
        normalPrice: Number(game.normalPrice),
        savings: Math.round(Number(game.savings)),
        dealRating: Number(game.dealRating),
        
        // Added for compatibility with the frontend
        dealID: game.dealID,
        metacriticScore: game.metacriticScore 
      }));

      fs.writeFileSync("data.json", JSON.stringify(parsed, null, 2));
      console.log("✅ data.json has been successfully updated with 60 latest deals!");
    } catch (error) {
      console.error("❌ Failed to parse data or write file:", error);
    }
  });
}).on("error", (err) => {
  console.error("❌ Error fetching data from API:", err.message);
});

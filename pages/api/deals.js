
export default async function handler(req, res) {
  try {
    // 1. Fetch all deals
    const dealsResponse = await fetch(
      "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60"
    );
    if (!dealsResponse.ok) throw new Error('Failed to fetch deals');
    const deals = await dealsResponse.json();

    // 2. Fetch details for all games in the deals list
    const gameIDs = deals.map(deal => deal.gameID).join(",");
    const gamesInfoResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${gameIDs}`);
    if (!gamesInfoResponse.ok) throw new Error('Failed to fetch game details');
    const gamesInfo = await gamesInfoResponse.json();

    // 3. Fetch all genres
    const genresResponse = await fetch("https://www.cheapshark.com/api/1.0/genres");
    if (!genresResponse.ok) throw new Error('Failed to fetch genres');
    const genres = await genresResponse.json();
    
    // 4. Merge data and add popularity score
    const enrichedData = deals.map(deal => {
      const info = gamesInfo[deal.gameID];
      const popularityScore = (parseFloat(deal.steamRatingPercent || 0) * 0.5) +
                              (parseFloat(deal.dealRating || 0) * 0.3) +
                              (parseFloat(deal.savings || 0) * 0.2);
      return {
        ...deal,
        genres: info ? info.info.genres : [],
        cheapestPriceEver: info ? info.cheapestPriceEver : { price: "9999" },
        popularityScore,
      };
    });

    // 5. Send the final combined data
    res.status(200).json({
        games: enrichedData,
        genres: genres
    });

  } catch (error) {
    console.error("API Route Error:", error);
    res.status(500).json({ error: "데이터를 불러오는 데 실패했습니다." });
  }
}

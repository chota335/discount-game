
export default async function handler(req, res) {
  try {
    const { g: genreId, q: searchQuery, sortBy, maxPrice, metacritic } = req.query;

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

    // 5. Apply filters
    let filteredData = enrichedData;

    if (genreId && genreId !== 'all') {
      const genreMap = new Map(genres.map(g => [g.genreID.toString(), g.name.toLowerCase()]));
      const targetGenreName = genreMap.get(genreId);
      if (targetGenreName) {
        filteredData = filteredData.filter(deal => 
            deal.genres && deal.genres.map(g => g.toLowerCase()).includes(targetGenreName)
        );
      }
    }

    if (searchQuery) {
        filteredData = filteredData.filter(deal =>
            deal.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (maxPrice) {
        filteredData = filteredData.filter(deal =>
            parseFloat(deal.salePrice) <= parseFloat(maxPrice)
        );
    }

    if (metacritic) {
        filteredData = filteredData.filter(deal =>
            parseInt(deal.metacriticScore) >= parseInt(metacritic)
        );
    }

    // 6. Apply sorting
    switch(sortBy) {
        case 'price':
            filteredData.sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
            break;
        case 'metacritic':
            filteredData.sort((a, b) => parseInt(b.metacriticScore) - parseInt(a.metacriticScore));
            break;
        case 'savings':
            filteredData.sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings));
            break;
        default:
            filteredData.sort((a, b) => b.popularityScore - a.popularityScore);
            break;
    }

    // 7. Send the final combined and filtered data
    res.status(200).json(filteredData);

  } catch (error) {
    console.error("API Route Error:", error);
    res.status(500).json({ error: "데이터를 불러오는 데 실패했습니다." });
  }
}

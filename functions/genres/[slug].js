export async function onRequest(context) {
  const { params } = context;
  const genre = params.slug;

  try {
    let deals = [];
    if (genre === 'all') {
      let dealsResponse;
      try {
        dealsResponse = await fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60");
        if (!dealsResponse.ok) {
          throw new Error(`Failed to fetch deals from CheapShark API. Status: ${dealsResponse.status}`);
        }
      } catch (e) {
        console.error('Error fetching from deals API:', e);
        return new Response(JSON.stringify({ error: "Failed to fetch deals." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      deals = await dealsResponse.json();
    } else {
      // This part is not used for 'all' but good to have robust error handling
      // ...
    }

    if (!deals || deals.length === 0) {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    }

    const gameIDs = deals.map(deal => deal.gameID).join(",");
    let gamesInfoResponse;
    try {
      gamesInfoResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${gameIDs}`);
      if (!gamesInfoResponse.ok) {
        throw new Error(`Failed to fetch game details from CheapShark API. Status: ${gamesInfoResponse.status}`);
      }
    } catch (e) {
      console.error('Error fetching from games API:', e);
      return new Response(JSON.stringify({ error: "Failed to fetch game details." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const gamesInfo = await gamesInfoResponse.json();

    const enrichedDeals = deals.map(deal => {
      const gameInfo = gamesInfo[deal.gameID];
      if (!gameInfo) return null; // Skip if no game info
      return {
        ...deal,
        metacriticScore: gameInfo.info.metacriticScore || 'N/A',
      };
    }).filter(Boolean); // Filter out nulls

    return new Response(JSON.stringify(enrichedDeals), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("General onRequest Error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const searchQuery = searchParams.get('q');
  const filter = searchParams.get('filter');

  // Base API URL
  let apiUrl = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&onSale=1";

  // Apply filters
  if (filter === 'aaa') {
    // For AAA games, sort by savings and filter for games with at least 80% discount
    apiUrl += "&AAA=1&sortBy=Savings&savings=80";
  } else {
    // For all other general deals, sort by deal rating
    apiUrl += "&sortBy=Deal%20Rating";
  }

  // Apply search query if it exists
  if (searchQuery) {
    apiUrl += `&title=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const dealsResponse = await fetch(apiUrl);
    if (!dealsResponse.ok) {
      throw new Error(`Failed to fetch deals from CheapShark API. Status: ${dealsResponse.status}`);
    }
    let deals = await dealsResponse.json();

    // If no deals are found, return an empty array
    if (!deals || deals.length === 0) {
      return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    }

    // Enrich deals with better thumbnail images from the games API
    const gameIDs = deals.map(deal => deal.gameID).join(",");
    const gamesInfoResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${gameIDs}`);
    
    let enrichedDeals = deals;
    if (gamesInfoResponse.ok) {
      const gamesInfo = await gamesInfoResponse.json();
      enrichedDeals = deals.map(deal => {
        const gameInfo = gamesInfo[deal.gameID];
        return {
          ...deal,
          thumb: gameInfo ? gameInfo.info.thumb : deal.thumb, 
        };
      });
    } else {
        // If fetching extra info fails, we still return the original deals
        console.error('Could not fetch additional game info. Proceeding with original deal data.');
    }

    // Return the final list of deals
    return new Response(JSON.stringify(enrichedDeals), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in API route (/api/deals):`, error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred while fetching deals." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

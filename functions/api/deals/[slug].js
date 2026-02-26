export async function onRequest(context) {
  const { params } = context;
  const category = params.slug;

  // Build the API URL based on the category
  let apiUrl = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=30";
  switch (category) {
    case 'metacritic':
      apiUrl += "&sortBy=Metacritic";
      break;
    case 'aaa':
      apiUrl += "&AAA=1";
      break;
    case 'reviews':
        apiUrl += "&sortBy=Reviews";
        break;
    case 'all':
    default:
      // no extra params needed for 'all'
      break;
  }

  try {
    const dealsResponse = await fetch(apiUrl);
    if (!dealsResponse.ok) {
      throw new Error(`Failed to fetch deals from CheapShark API. Status: ${dealsResponse.status}`);
    }
    let deals = await dealsResponse.json();

    if (!deals || deals.length === 0) {
      return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    }

    const gameIDs = deals.map(deal => deal.gameID).join(",");
    const gamesInfoResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${gameIDs}`);
    if (!gamesInfoResponse.ok) {
        console.error('Could not fetch additional game info.');
        return new Response(JSON.stringify(deals), { headers: { 'Content-Type': 'application/json' } });
    }
    const gamesInfo = await gamesInfoResponse.json();

    const enrichedDeals = deals.map(deal => {
      const gameInfo = gamesInfo[deal.gameID];
      return {
        ...deal,
        thumb: gameInfo ? gameInfo.info.thumb : deal.thumb, 
      };
    });

    return new Response(JSON.stringify(enrichedDeals), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in onRequest for category ${category}:`, error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

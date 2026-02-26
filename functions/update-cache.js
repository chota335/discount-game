export async function onRequest(context) {
  const { env } = context;

  const CHEAP_URL =
    "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=1000";

  const dealsRes = await fetch(CHEAP_URL);
  if (!dealsRes.ok) {
    return new Response("Failed to fetch deals from CheapShark", { status: 500 });
  }
  const deals = await dealsRes.json();

  const appids = [...new Set(deals.map(deal => deal.steamAppID).filter(id => id))];
  const genreMap = {};
  const batchSize = 100; // Fetch 100 app details at a time

  for (let i = 0; i < appids.length; i += batchSize) {
    const batch = appids.slice(i, i + batchSize);
    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${batch.join(',')}&filters=genres`;
    
    try {
      const steamRes = await fetch(steamUrl);
      if (!steamRes.ok) {
        console.error(`Steam API request failed with status: ${steamRes.status}`);
        continue; // Skip this batch if it fails
      }
      const steamData = await steamRes.json();

      for (const appid of batch) {
        if (steamData[appid]?.success) {
          const genres =
            steamData[appid].data.genres?.map(g =>
              g.description.toLowerCase()
            ) || [];
          genreMap[appid] = genres;
        }
      }
    } catch (error) {
        console.error(`Error fetching batch ${i/batchSize}:`, error);
    }
    // Add a small delay to avoid hitting rate limits aggressively
    await new Promise(resolve => setTimeout(resolve, 200)); 
  }

  const enriched = deals.map(game => ({
    ...game,
    genres: genreMap[game.steamAppID] || []
  }));

  await env.GAME_CACHE.put("all_games", JSON.stringify(enriched), {
    expirationTtl: 60 * 60 * 6 // 6 hours
  });

  return new Response("Cache Updated successfully with enriched genre data.");
}

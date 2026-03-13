export async function onRequestGet(context) {
  const { env } = context;

  const CHEAP_URL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=500";
  const ALL_GAMES_URL = new URL("/data.json", context.request.url).toString();

  try {
    // Fetch deals and all games data in parallel
    const [dealsRes, allGamesRes] = await Promise.all([
      fetch(CHEAP_URL),
      fetch(ALL_GAMES_URL)
    ]);

    if (!dealsRes.ok) {
      return new Response("Failed to fetch deals from CheapShark", { status: 500 });
    }
    if (!allGamesRes.ok) {
      return new Response("Failed to fetch local game data", { status: 500 });
    }

    const deals = await dealsRes.json();
    const allGames = await allGamesRes.json();

    // Create a map for quick genre lookups
    const genreMap = allGames.reduce((acc, game) => {
        acc[game.appid] = game.genres;
        return acc;
    }, {});

    // Enrich deals with genre data
    const enriched = deals.map(game => ({
      ...game,
      // Use the Steam App ID to find the genres
      genres: genreMap[game.steamAppID] || [] 
    }));

    // Cache the enriched data
    await env.GAME_CACHE.put("all_games", JSON.stringify(enriched), {
      expirationTtl: 60 * 60 * 6, // 6 hours
    });

    return new Response("Cache updated successfully with enriched genre data.", {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error) {
    console.error("Error updating cache:", error);
    return new Response("Failed to update cache.", { status: 500 });
  }
}

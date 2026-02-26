/**
 * Advanced Cloudflare Pages Function for DiscountDealGame.
 * - Fetches deals from the CheapShark API based on genre.
 * - Maps simple genre names to CheapShark genre IDs.
 * - Caches API responses server-side for performance and rate-limiting.
 * - Sorts data on the server based on client-side sorting preferences.
 * - Returns a clean, paginated (top 60) list of deals to the client.
 */

const API_BASE_URL = "https://www.cheapshark.com/api/1.0";
const CACHE_TTL_SECONDS = 900; // 15 minutes

const genreIdMap = {
    'action': '2',
    'indie': '23',
    'adventure': '3',
    'rpg': '5',
    'strategy': '9',
    'simulation': '7',
    'sports_racing': '8', 
    'casual': '4',
    'open_world': '38',
    'horror': '17',
    'sci_fi': '30',
    'fantasy': '15'
};

async function fetchAndCacheDeals(genreId, context) {
    const url = `${API_BASE_URL}/deals?storeID=1&onSale=1&pageSize=500${genreId ? `&genre=${genreId}` : ''}`;
    
    const cacheUrl = new URL(url);
    const cacheKey = new Request(cacheUrl.toString(), context.request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);

    if (!response) {
        console.log(`Cache miss for ${genreId || 'all'.toUpperCase()}. Fetching from API.`);
        response = await fetch(url);
        if(response.ok) {
             context.waitUntil(cache.put(cacheKey, response.clone()));
        }
    }

    if (!response.ok) {
        throw new Error(`CheapShark API responded with status: ${response.status}`);
    }
    return response.json();
}

function sortDeals(deals, sortBy) {
    // Create a mutable copy for sorting
    const sortedDeals = [...deals]; 

    switch (sortBy) {
        case 'metacritic':
            sortedDeals.sort((a, b) => parseInt(b.metacriticScore, 10) - parseInt(a.metacriticScore, 10));
            break;
        case 'reviews':
            sortedDeals.sort((a, b) => parseInt(b.steamRatingPercent, 10) - parseInt(a.steamRatingPercent, 10));
            break;
        case 'price':
            sortedDeals.sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
            break;
        case 'savings':
        default:
            sortedDeals.sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings));
            break;
    }
    return sortedDeals;
}

export async function onRequest(context) {
    try {
        const url = new URL(context.request.url);
        const genre = url.searchParams.get('genre') || 'all';
        const sortBy = url.searchParams.get('sort') || 'savings';

        const genreId = genre === 'all' ? null : genreIdMap[genre];

        const rawDeals = await fetchAndCacheDeals(genreId, context);
        const sortedDeals = sortDeals(rawDeals, sortBy);
        const finalDeals = sortedDeals.slice(0, 60);

        return new Response(JSON.stringify(finalDeals), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`
            },
        });

    } catch (error) {
        console.error('Error in Cloudflare function:', error.message);
        return new Response(JSON.stringify({ error: 'Failed to fetch deals' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
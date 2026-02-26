/**
 * Cloudflare Function: /functions/genres.js
 * Returns a predefined list of game genres.
 * This allows for easy updates to the genre list without changing frontend code.
 */
export async function onRequest(context) {
    const genres = [
        { id: 'action', name: '액션', emoji: '💥' },
        { id: 'rpg', name: 'RPG', emoji: '🧙' },
        { id: 'strategy', name: '전략', emoji: '♟️' },
        { id: 'adventure', name: '어드벤처', emoji: '🗺️' },
        { id: 'simulation', name: '시뮬레이션', emoji: '🏗️' },
        { id: 'sports_racing', name: '스포츠 & 레이싱', emoji: '🏎️' }, // ID updated for clarity
        { id: 'indie', name: '인디', emoji: '💡' },
        { id: 'casual', name: '캐주얼', emoji: '🎲' },
        { id: 'open_world', name: '오픈월드', emoji: '🌍' },
        { id: 'horror', name: '공포', emoji: '👻' },
        { id: 'sci_fi', name: 'SF', emoji: '🚀' },
        { id: 'fantasy', name: '판타지', emoji: '🐉' },
    ];

    return new Response(JSON.stringify(genres), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        },
    });
}
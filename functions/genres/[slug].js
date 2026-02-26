export async function onRequest(context) {
  const { params, env } = context;
  const slug = params.slug.toLowerCase();

  const cached = await env.GAME_CACHE.get("all_games");

  if (!cached) {
    return new Response(JSON.stringify({ error: "Cache empty. Run /api/refresh first." }), {
      status: 500,
      headers: { "Content-Type": "application/json;charset=UTF-8" }
    });
  }

  const games = JSON.parse(cached);

  if (slug === 'all') {
    return new Response(JSON.stringify(games), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }

  const filtered = games.filter(game =>
    game.genres.includes(slug)
  );

  const html = filtered
    .map(game => {
      const priceKRW = Math.round(parseFloat(game.salePrice) * 1350);

      return `
        <div class="card">
          <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank">
            <img src="${game.thumb}">
            <h3>${game.title}</h3>
            <div class="price">
              <span class="sale">${Math.round(game.savings)}% OFF</span>
              <span class="krw">${priceKRW.toLocaleString()}원</span>
            </div>
          </a>
        </div>
      `;
    })
    .join("");

  const title = `${slug.toUpperCase()} 할인 게임 | Discount Deal Game`;

  return new Response(`
    <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${slug} 장르 할인 게임 모음">
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>${slug.toUpperCase()} 할인 게임</h1>
        <div class="grid">${html}</div>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}

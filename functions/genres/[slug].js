export async function onRequest(context) {
  const { env, params, request } = context;
  const slug = params.slug.toLowerCase();

  const allGames = await env.GAME_CACHE.get("all_games", "json");

  if (!allGames) {
    return new Response("Cache is warming up. Please try again in a few moments.", { status: 503 });
  }

  // For the frontend script, if it asks for JSON, return all games.
  if (slug === 'all' && request.headers.get('Accept')?.includes('application/json')) {
    return new Response(JSON.stringify(allGames), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }

  // For browser navigation, filter and return an HTML page.
  const filtered = allGames.filter(game => {
    if (slug === 'all') return true;
    return game.genres?.includes(slug);
  });

  const gamesHTML = filtered.map(game => {
    const priceKRW = Math.round(parseFloat(game.salePrice) * 1300);
    return `
      <div class="game-card">
        <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank">
          <img src="${game.thumb}" alt="${game.title}" />
          <h3>${game.title}</h3>
          <div class="price">
            <span class="discount">${Math.round(game.savings)}% 할인</span>
            <span class="krw">${priceKRW.toLocaleString()}원</span>
          </div>
        </a>
      </div>
    `;
  }).join("");

  return new Response(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${slug.toUpperCase()} 할인 게임 | DiscountDealGame</title>
      <meta name="description" content="${slug} 장르 스팀 할인 게임 모음 페이지">
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
       <nav class="navbar">
        <div class="logo"><a href="/">🎮 DiscountDealGame</a></div>
        <ul class="nav-links">
          <li><a href="/">홈</a></li>
          <li><a href="/guide.html">세일 가이드</a></li>
          <li><a href="/genres/all">장르별</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/privacy.html">개인정보처리방침</a></li>
        </ul>
      </nav>
      <header class="header">
        <h1>🎮 ${slug.toUpperCase()} 할인 게임</h1>
      </header>
      <div class="game-grid">
        ${gamesHTML}
      </div>
       <footer class="footer">
        <div class="footer-links">
          <a href="/">홈</a> |
          <a href="/guide.html">세일 가이드</a> |
          <a href="/genres/all">장르별</a> |
          <a href="/about.html">About</a> |
          <a href="/privacy.html">개인정보처리방침</a>
        </div>
        <p>본 사이트는 Steam 할인 정보를 제공하는 정보 제공 사이트입니다.</p>
        <p>© 2024 DiscountDealGame. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}

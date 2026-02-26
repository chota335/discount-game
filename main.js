document.addEventListener("DOMContentLoaded", () => {
  const exchangeRate = 1300;
  const gamesContainer = document.getElementById("gamesContainer");
  const aaaContainer = document.getElementById("aaaContainer");
  const highDiscountContainer = document.getElementById("highDiscountContainer");
  const loading = document.getElementById("loading");

  async function fetchGames() {
    try {
      const response = await fetch("/functions/genres/all", {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allGames = await response.json();
      displayGames(allGames);
      loading.style.display = "none";
    } catch (error) {
      console.error("Error fetching games:", error);
      if (loading) loading.innerHTML = "데이터를 불러오는 데 실패했습니다.";
    }
  }

  function displayGames(games) {
    const aaaGames = games.filter(game => game.metacriticScore >= 80).slice(0, 20);
    const highDiscountGames = games.filter(game => parseFloat(game.savings) >= 80).slice(0, 20);

    renderGames(aaaContainer, aaaGames);
    renderGames(highDiscountContainer, highDiscountGames);
    renderGames(gamesContainer, games.slice(0, 100)); 
  }

  function renderGames(container, games) {
    if (!container || !games) return;
    container.innerHTML = games.map(game => {
      const priceKRW = Math.round(parseFloat(game.salePrice) * exchangeRate);
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
  }

  if(document.getElementById('gamesContainer')) {
    fetchGames();
  }
});

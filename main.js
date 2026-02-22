const API_URL = "/api";
const exchangeRate = 1350;

let gamesData = [];

document.addEventListener("DOMContentLoaded", () => {
  const gamesContainer = document.getElementById("gamesContainer");
  const popularContainer = document.getElementById("popular-games");
  const loading = document.getElementById("loading");
  const priceFilter = document.getElementById("priceFilter");

  if (!gamesContainer || !popularContainer || !loading || !priceFilter) {
    console.error("필수 DOM 요소를 찾을 수 없습니다!");
    return;
  }

  async function fetchGames() {
    try {
      const pages = [0, 1, 2, 3, 4];
      const requests = pages.map(page =>
        fetch(`${API_URL}?page=${page}`).then(res => res.json())
      );

      const results = await Promise.all(requests);
      gamesData = results.flat();

      renderPopularGames();
      renderAllGames();
    } catch (e) {
      console.error("데이터를 불러오는 중 오류 발생:", e);
      loading.innerText = "데이터 로딩 실패 😢";
    } finally {
      if (loading) loading.style.display = "none";
    }
  }

  function renderPopularGames() {
    const popular = gamesData.filter(
      g => g.steamRatingCount > 10000 && g.steamRatingPercent > 85
    );
    renderSection("popular-games", popular);
  }

  function renderAllGames() {
    const maxPrice = priceFilter.value;
    const filteredGames = gamesData.filter(game => {
      const priceKRW = game.salePrice * exchangeRate;
      return maxPrice === "all" || priceKRW <= Number(maxPrice);
    });
    renderSection("gamesContainer", filteredGames);
  }

  function renderSection(containerId, games) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";

      const ratingColor = getRatingColor(game.steamRatingPercent);

      card.innerHTML = `
        <img src="${game.thumb}" alt="${game.title}">
        <div class="card-body">
          <h3>${game.title}</h3>
          <div class="price">
            <div class="discount">${Math.round(game.savings)}% 할인</div>
            <div>₩${Math.round(game.salePrice * 1300).toLocaleString()}</div>
          </div>
          <div class="rating">
            <span class="rating-percent" style="color: ${ratingColor}">${game.steamRatingPercent}%</span>
            <span class="rating-count">(${Number(game.steamRatingCount).toLocaleString()})</span>
          </div>
        </div>
      `;
      card.addEventListener("click", () => {
        window.open(
          `https://store.steampowered.com/app/${game.steamAppID}/?l=koreana`,
          "_blank"
        );
      });

      container.appendChild(card);
    });
  }

  function getRatingColor(percent) {
    if (percent >= 90) return "#66ccff";
    if (percent >= 80) return "#ffffff";
    return "#a3a3a3";
  }

  priceFilter.addEventListener("change", renderAllGames);
  fetchGames();
});

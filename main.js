const API_URL = "/api";
const exchangeRate = 1350;

let gamesData = [];

document.addEventListener("DOMContentLoaded", () => {
  const gamesContainer = document.getElementById("gamesContainer");
  const loading = document.getElementById("loading");
  const priceFilter = document.getElementById("priceFilter");

  if (!gamesContainer || !loading || !priceFilter) {
    console.error("필수 DOM 요소를 찾을 수 없습니다!");
    return;
  }

  async function fetchGames() {
    try {
      const res = await fetch(API_URL);
      gamesData = await res.json();
      renderGames();
    } catch (e) {
      console.error("데이터를 불러오는 중 오류 발생:", e);
      loading.innerText = "데이터 로딩 실패 😢";
    } finally {
      if (loading) loading.style.display = "none";
    }
  }

  function renderGames() {
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

      card.innerHTML = `
        <img src="${game.thumb}" alt="${game.title}">
        <div class="card-body">
          <h3>${game.title}</h3>
          <div class="price">
            <div class="discount">${Math.round(game.savings)}% 할인</div>
            <div>₩${Math.round(game.salePrice * 1300).toLocaleString()}</div>
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

  priceFilter.addEventListener("change", renderGames);
  fetchGames();
});
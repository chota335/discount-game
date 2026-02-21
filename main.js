const API_URL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=40";
const gamesContainer = document.getElementById("gamesContainer");
const loading = document.getElementById("loading");

let gamesData = [];

async function fetchGames() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    gamesData = data;
    renderGames();
  } catch (error) {
    if (loading) {
      loading.innerText = "데이터 불러오기 실패 😢";
    }
    console.error("Fetch Error:", error);
  } finally {
    if (loading) {
      loading.style.display = "none";
    }
  }
}

function renderGames() {
  if (!gamesContainer) return;
  gamesContainer.innerHTML = "";

  gamesData.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";

    let imageUrl = game.steamAppID
      ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`
      : game.thumb;

    card.innerHTML = `
      <div class="discount-badge">-${Math.round(game.savings)}%</div>
      ${game.savings > 70 ? `<div class="aaa-badge">HOT</div>` : ""}

      <img src="${imageUrl}" alt="${game.title}" />

      <div class="game-info">
        <div class="game-title">${game.title}</div>
        <div class="price-row">
          <div class="sale-price">$${game.salePrice}</div>
          <div style="text-decoration: line-through; opacity:0.6;">
            $${game.normalPrice}
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(`https://www.cheapshark.com/redirect?dealID=${game.dealID}`, "_blank");
    });

    gamesContainer.appendChild(card);
  });
}

fetchGames();

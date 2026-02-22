const gamesContainer = document.getElementById("gamesContainer");
const loading = document.getElementById("loading");
const searchInput = document.getElementById("searchInput");

let gamesData = [];
const exchangeRate = 1350; // 대충 환율 (나중에 API로 자동화 가능)

function formatKRW(price) {
  return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

async function fetchGames() {
  try {
    let allGames = [];

    for (let page = 0; page < 3; page++) {
      const response = await fetch(
        `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=100&pageNumber=${page}`
      );
      const data = await response.json();
      allGames = allGames.concat(data);
    }

    gamesData = allGames;
    renderGames(gamesData);
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

function renderGames(games) {
  if (!gamesContainer) return;
  gamesContainer.innerHTML = "";

  if (games.length === 0) {
      gamesContainer.innerHTML = `<p style="text-align: center; width: 100%;">검색 결과가 없습니다.</p>`;
      return;
  }

  games.forEach(game => {
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
          <div class="sale-price">${formatKRW(game.salePrice)}</div>
          <div style="text-decoration: line-through; opacity:0.6;">
            ${formatKRW(game.normalPrice)}
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      // Track the click in the background
      fetch(`/functions/track-click?dealID=${game.dealID}`);

      // Open the deal in a new tab
      window.open(`https://www.cheapshark.com/redirect?dealID=${game.dealID}`, "_blank");
    });

    gamesContainer.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredGames = gamesData.filter(game =>
    game.title.toLowerCase().includes(searchTerm)
  );
  renderGames(filteredGames);
});

fetchGames();

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
    // If loading element exists, show error message
    if (loading) {
      loading.innerText = "데이터 불러오기 실패 😢";
    }
    console.error("Fetch Error:", error);
  } finally {
    // If loading element exists, hide it
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

    card.innerHTML = `
      <img src="${game.thumb}" alt="${game.title}" loading="lazy" />
      <h3>${game.title}</h3>
      <div class="price">
        <div class="discount">${Math.round(game.savings)}% 할인</div>
        <div>$${game.salePrice}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(`https://www.cheapshark.com/redirect?dealID=${game.dealID}`, "_blank");
    });

    gamesContainer.appendChild(card);
  });
}

// Run the script
fetchGames();

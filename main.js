const API_URL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60";
const exchangeRate = 1350;

const popularContainer = document.getElementById("popularContainer");
const megaContainer = document.getElementById("megaContainer");
const cheapContainer = document.getElementById("cheapContainer");
const allContainer = document.getElementById("allContainer");
const loading = document.getElementById("loading");

let gamesData = [];

function formatKRW(price) {
  return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

function isPopular(game) {
  return (
    Number(game.steamRatingCount) > 5000 &&
    Number(game.steamRatingPercent) > 85
  );
}

function createCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  card.innerHTML = `
    <img src="${game.thumb}" alt="${game.title}">
    <div class="card-body">
      <h3>${game.title}</h3>
      <div class="price">
        <div class="discount">${Math.round(game.savings)}% 할인</div>
        <div>${formatKRW(game.salePrice)}</div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    window.open(
      `https://store.steampowered.com/app/${game.steamAppID}/?l=koreana`,
      "_blank"
    );
  });

  return card;
}

async function fetchGames() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    gamesData = data;

    renderSections();
  } catch (err) {
    loading.innerText = "데이터 불러오기 실패 😢";
  } finally {
    loading.style.display = "none";
  }
}

function renderSections() {
  popularContainer.innerHTML = "";
  megaContainer.innerHTML = "";
  cheapContainer.innerHTML = "";
  allContainer.innerHTML = "";

  gamesData.forEach(game => {
    const card = createCard(game);

    // 인기
    if (isPopular(game)) {
      popularContainer.appendChild(card.cloneNode(true));
    }

    // 80% 이상
    if (Number(game.savings) >= 80) {
      megaContainer.appendChild(card.cloneNode(true));
    }

    // 1만원 이하
    if (Number(game.salePrice) * exchangeRate <= 10000) {
      cheapContainer.appendChild(card.cloneNode(true));
    }

    allContainer.appendChild(card);
  });
}

fetchGames();
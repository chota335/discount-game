const exchangeRate = 1300;
const API_BASE = "https://www.cheapshark.com/api/1.0/deals";

const pages = [0,1,2,3,4]; // 500개

let gamesData = [];
let selectedGenre = null;

const gamesContainer = document.getElementById("gamesContainer");
const aaaContainer = document.getElementById("aaaContainer");
const loading = document.getElementById("loading");
const genreFilters = document.getElementById("genreFilters");

function formatKRW(price) {
  return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

function getEndDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return `${date.getMonth()+1}/${date.getDate()} 종료`;
}

async function fetchDeals() {
  try {
    const requests = pages.map(page =>
      fetch(`${API_BASE}?storeID=1&pageSize=100&pageNumber=${page}`)
        .then(res => res.json())
    );

    const results = await Promise.all(requests);
    gamesData = results.flat();

    renderAAA();
    renderGenres();
    renderGames();

  } catch (err) {
    loading.innerText = "데이터 불러오기 실패 😢";
    console.error(err);
  } finally {
    loading.style.display = "none";
  }
}

function isAAA(game) {
  return (
    game.steamRatingCount > 20000 &&
    game.steamRatingPercent > 85 &&
    game.metacriticScore > 80
  );
}

function renderAAA() {
  const aaaGames = gamesData.filter(isAAA).slice(0,20);
  aaaContainer.innerHTML = "";
  aaaGames.forEach(game => {
    aaaContainer.appendChild(createCard(game));
  });
}

function renderGenres() {
  const genreSet = new Set();

  gamesData.forEach(game => {
    if (game.steamRatingText) {
      genreSet.add(game.steamRatingText);
    }
  });

  genreFilters.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.innerText = "전체";
  allBtn.onclick = () => {
    selectedGenre = null;
    renderGames();
  };
  genreFilters.appendChild(allBtn);

  genreSet.forEach(genre => {
    const btn = document.createElement("button");
    btn.innerText = genre;
    btn.onclick = () => {
      selectedGenre = genre;
      renderGames();
    };
    genreFilters.appendChild(btn);
  });
}

function renderGames() {
  gamesContainer.innerHTML = "";

  let filtered = gamesData;

  if (selectedGenre) {
    filtered = gamesData.filter(g => g.steamRatingText === selectedGenre);
  }

  filtered.slice(0,500).forEach(game => {
    gamesContainer.appendChild(createCard(game));
  });
}

function createCard(game) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${game.thumb}" />
    <h3>${game.title}</h3>
    <div class="price">
      <span class="discount">${Math.round(game.savings)}%</span>
      <span class="sale">${formatKRW(game.salePrice)}</span>
    </div>
    <div class="end">${getEndDate(game.lastChange)}</div>
  `;

  card.onclick = () => {
    window.open(
      `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
      "_blank"
    );
  };

  return card;
}

fetchDeals();
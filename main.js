const API_URL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=80";
const exchangeRate = 1350;

let gamesData = [];
let genreMap = {};

function formatKRW(price) {
  return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

async function fetchGenres(appID) {
  try {
    const res = await fetch(`/genres?appids=${appID}`);
    const data = await res.json();
    const genres = data[appID]?.data?.genres;
    if (!genres) return ["기타"];
    return genres.map(g => g.description);
  } catch {
    return ["기타"];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const genreSections = document.getElementById("genreSections");
  const loading = document.getElementById("loading");
  const priceFilter = document.getElementById("priceFilter");

  if (!genreSections || !loading || !priceFilter) {
    console.error("필수 DOM 요소를 찾을 수 없습니다!");
    return;
  }

  async function fetchGames() {
    try {
      const res = await fetch(API_URL);
      gamesData = await res.json();

      for (const game of gamesData) {
        if (!game.steamAppID) continue;
        const genres = await fetchGenres(game.steamAppID);
        game.genres = genres;
        genres.forEach(g => {
          if (!genreMap[g]) genreMap[g] = [];
          genreMap[g].push(game);
        });
      }
      renderGenres();
    } catch (e) {
      console.error("데이터를 불러오는 중 오류 발생:", e);
      loading.innerText = "데이터 로딩 실패 😢";
    } finally {
      loading.style.display = "none";
    }
  }

  function renderGenres() {
    genreSections.innerHTML = "";
    const maxPrice = priceFilter.value;

    Object.keys(genreMap).sort().forEach(genre => {
      const filteredGames = genreMap[genre].filter(game => {
        const priceKRW = game.salePrice * exchangeRate;
        return maxPrice === "all" || priceKRW <= Number(maxPrice);
      });

      if (filteredGames.length > 0) {
        const section = document.createElement("div");
        section.className = "genre-section";

        const title = document.createElement("h2");
        title.innerText = genre;
        section.appendChild(title);

        const gamesDiv = document.createElement("div");
        gamesDiv.className = "games";

        filteredGames.forEach(game => {
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
          gamesDiv.appendChild(card);
        });

        section.appendChild(gamesDiv);
        genreSections.appendChild(section);
      }
    });
  }

  priceFilter.addEventListener("change", renderGenres);
  fetchGames();
});
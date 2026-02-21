const API_URL = "/api/deals";
const exchangeRate = 1300;

let gamesData = [];
let genresData = [];
let selectedGenre = null;

// --- UTILITY FUNCTIONS ---
function formatKRW(price) {
  return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

function getCountdown(releaseDate) {
    const now = new Date();
    const end = new Date(releaseDate * 1000);
    const diff = end - now;

    if (diff <= 0) return "종료됨";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 48) return `${end.getMonth() + 1}월 ${end.getDate()}일 종료`;
    if (hours > 24) return `내일 종료`;
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}시간 ${minutes}분 남음`;
}

function checkLowest(game) {
    if (game.cheapestPriceEver && parseFloat(game.salePrice) <= parseFloat(game.cheapestPriceEver.price)) {
        return '🏆 역대 최저가!';
    }
    return '';
}

// --- DATA FETCHING ---
async function fetchAndPrepareData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const { games, genres } = await response.json();
        
        gamesData = games;
        genresData = genres;
        
        renderGenreFilters();
        renderSections();
    } catch (error) {
        console.error("Error fetching data:", error);
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 18px;">데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</div>';
    }
}

// --- RENDERING ---
function createCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    let countdownHTML = "";
    if (game.releaseDate > 0 && (game.releaseDate * 1000) > Date.now()) {
        countdownHTML = `<div class="countdown">⏰ ${getCountdown(game.releaseDate)}</div>`;
    }

    card.innerHTML = `
        ${countdownHTML}
        <div class="discount-badge">${Math.round(game.savings)}%</div>
        <img src="https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg" 
             onerror="this.src='${game.thumb}'"/>
        <div class="game-title">${game.title}</div>
        <div class="price-box">
            <div class="original">${formatKRW(game.normalPrice)}</div>
            <div class="sale">${formatKRW(game.salePrice)}</div>
        </div>
        <div class="lowest">
            ${checkLowest(game)}
        </div>
    `;
    card.addEventListener("click", () => window.open(`https://store.steampowered.com/app/${game.steamAppID}`, "_blank"));
    return card;
}

function renderGenreFilters() {
    const container = document.getElementById("genreFilterContainer");
    if (!container) return;

    const allGenres = new Set(gamesData.flatMap(g => g.genres).filter(Boolean));
    const genreMap = genresData.reduce((map, genre) => {
        map[genre.genreID] = genre.genreName;
        return map;
    }, {});

    const createButton = (text, genreId) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.className = 'genre-btn';
        if (selectedGenre === genreId) button.classList.add('active');
        
        button.addEventListener("click", () => {
            selectedGenre = selectedGenre === genreId ? null : genreId;
            renderGenreFilters();
            renderSections();
        });
        return button;
    }

    container.innerHTML = ''; // Clear old buttons
    container.appendChild(createButton('All', null));

    allGenres.forEach(genreId => {
        if (genreMap[genreId]) {
            container.appendChild(createButton(genreMap[genreId], genreId));
        }
    });
}

function renderSections() {
    const filteredGames = selectedGenre 
        ? gamesData.filter(g => g.genres && g.genres.includes(selectedGenre))
        : gamesData;

    const endingSoon = filteredGames
        .filter(g => g.releaseDate > 0 && (g.releaseDate * 1000) > Date.now())
        .sort((a, b) => a.releaseDate - b.releaseDate)
        .slice(0, 10);

    const highDiscount = filteredGames.filter(g => g.savings >= 70);
    
    const popular = [...filteredGames]
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, 10);

    const containers = {
        endingContainer: endingSoon,
        highDiscountContainer: highDiscount,
        popularContainer: popular,
        gamesContainer: filteredGames,
    };

    for (const containerId in containers) {
        const element = document.getElementById(containerId);
        if (element) {
            element.innerHTML = '';
            element.append(...containers[containerId].map(createCard));
        }
    }
}

// --- INITIALIZATION ---
fetchAndPrepareData();
setInterval(fetchAndPrepareData, 60000); // Now we re-fetch everything to get fresh data

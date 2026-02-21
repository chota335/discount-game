const API_URL = "./data.json";
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
    if (hours > 48) return \`${end.getMonth() + 1}월 ${end.getDate()}일 종료\`;
    if (hours > 24) return \`내일 종료\`;
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return \`${hours}시간 ${minutes}분 남음\`;
}

function checkLowest(game) {
    if (game.cheapestPriceEver && parseFloat(game.salePrice) <= parseFloat(game.cheapestPriceEver.price)) {
        return '🏆 역대 최저가!';
    }
    return '';
}

// --- DATA FETCHING & RENDERING ---
async function fetchGames() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        gamesData = data.deals; // Extract the 'deals' array
        processAndRenderGames();
    } catch (e) {
        console.error("데이터 불러오기 실패:", e);
        showError();
    } finally {
        hideLoading();
    }
}

function processAndRenderGames() {
    if (!Array.isArray(gamesData) || gamesData.length === 0) {
        showError();
        return;
    }

    // Sort data
    gamesData.sort((a, b) => parseFloat(b.dealRating) - parseFloat(a.dealRating));
    
    // Extract genres for filter
    const allGenres = new Set();
    gamesData.forEach(game => {
        if(game.steamAppID) { // Only process games with a steamAppID
            // This part depends on having genre data, which cheapshark API doesn't provide in the deals list.
            // We will leave the genre filter UI for now but it won't be functional.
        }
    });
    genresData = ['All', ...Array.from(allGenres).sort()];

    // Render all components
    renderGames();
    renderHeroSection();
    renderSpecialSections();
    // renderGenreFilter(); 
}

function renderGames(filter = 'All') {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = ''; // Clear previous games

    const gamesToRender = (filter === 'All' || !selectedGenre) 
        ? gamesData 
        : gamesData.filter(game => game.genres && game.genres.includes(selectedGenre));

    if (gamesToRender.length === 0 && filter !== 'All') {
        container.innerHTML = `<p class="no-results">선택된 장르에 해당하는 게임이 없습니다.</p>`;
        return;
    }

    gamesToRender.forEach(game => {
        const gameCard = createGameCard(game);
        container.appendChild(gameCard);
    });
}

function renderHeroSection() {
    const heroContainer = document.getElementById('heroSection');
    const heroGame = gamesData.reduce((max, game) => parseFloat(game.dealRating) > parseFloat(max.dealRating) ? game : max, gamesData[0]);
    if (heroGame) {
        heroContainer.innerHTML = createHeroCard(heroGame);
    }
}

function renderSpecialSections() {
    const highDiscountContainer = document.getElementById('highDiscountContainer');
    const popularContainer = document.getElementById('popularContainer');
    const endingContainer = document.getElementById('endingContainer');

    highDiscountContainer.innerHTML = '';
    popularContainer.innerHTML = '';
    endingContainer.innerHTML = '';

    const highDiscountGames = [...gamesData]
        .filter(g => parseFloat(g.savings) >= 70)
        .sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings))
        .slice(0, 10);

    const popularGames = [...gamesData]
        .sort((a, b) => parseFloat(b.metacriticScore) - parseFloat(a.metacriticScore))
        .slice(0, 10);

    const endingSoonGames = [...gamesData]
        .filter(g => g.releaseDate && (new Date(g.releaseDate * 1000) - new Date()) / (1000 * 60 * 60) < 48)
        .sort((a, b) => a.releaseDate - b.releaseDate)
        .slice(0, 10);
        
    highDiscountGames.forEach(game => highDiscountContainer.appendChild(createGameCard(game, 'small')));
    popularGames.forEach(game => popularContainer.appendChild(createGameCard(game, 'small')));
    endingSoonGames.forEach(game => endingContainer.appendChild(createGameCard(game, 'small')));
}


// --- UI ELEMENT CREATION ---
function createGameCard(game, size = 'normal') {
    const isSmall = size === 'small';
    const card = document.createElement('div');
    card.className = `game-card ${isSmall ? 'game-card-small' : ''}`;
    card.innerHTML = \`
        <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank">
            <img src="${game.thumb.replace('capsule_231x87', 'header')}" alt="${game.title}" class="game-img">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-prices">
                    <span class="sale-price">${formatKRW(game.salePrice)}</span>
                    <span class="normal-price">${formatKRW(game.normalPrice)}</span>
                </div>
                <div class="game-discount">-${Math.round(game.savings)}%</div>
                <div class="badge-lowest">${checkLowest(game)}</div>
            </div>
        </a>
    \`;
    return card;
}

function createHeroCard(game) {
    return \`
        <div class="hero-card">
            <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank">
                <img src="${game.thumb.replace('capsule_231x87', 'library_hero')}" alt="${game.title}" class="hero-img">
                <div class="hero-overlay">
                    <h2>${game.title}</h2>
                    <p>지금 바로 ${Math.round(game.savings)}% 할인된 가격으로 만나보세요!</p>
                    <div class="hero-prices">
                        <span class="sale-price">${formatKRW(game.salePrice)}</span>
                        <span class="normal-price">${formatKRW(game.normalPrice)}</span>
                    </div>
                     <div class="badge-lowest-hero">${checkLowest(game)}</div>
                </div>
            </a>
        </div>
    \`;
}

function showLoading() {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '<div class="loader"></div><p class="loading-text">최고의 할인 상품을 찾고 있습니다...</p>';
}

function hideLoading() {
    // Content is replaced by renderGames, so we don't need to do anything here.
}

function showError() {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '<div class="error-message">데이터 불러오기 실패! 잠시 후 다시 시도해주세요.</div>';
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
});

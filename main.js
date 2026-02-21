const API_URL = "./data.json";
const exchangeRate = 1300;

let gamesData = [];

// --- UTILITY FUNCTIONS ---
function formatKRW(price) {
    return "₩" + Math.round(price * exchangeRate).toLocaleString();
}

// --- DATA FETCHING & RENDERING ---
async function fetchGames() {
    showLoading();
    try {
        // Add cache-busting query parameter
        const response = await fetch(`${API_URL}?v=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        gamesData = await response.json();
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

    // Sort data for the main list
    gamesData.sort((a, b) => parseFloat(b.dealRating) - parseFloat(a.dealRating));

    // Render all components
    renderGames();
    renderHeroSection();
    renderSpecialSections();
}

function renderGames() {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = ''; // Clear previous games

    if (gamesData.length === 0) {
        container.innerHTML = `<p class="no-results">표시할 게임이 없습니다.</p>`;
        return;
    }

    gamesData.forEach(game => {
        const gameCard = createGameCard(game);
        container.appendChild(gameCard);
    });
}

function renderHeroSection() {
    const heroContainer = document.getElementById('heroSection');
    // Find the game with the highest deal rating for the hero section
    const heroGame = gamesData.reduce((max, game) => parseFloat(game.dealRating) > parseFloat(max.dealRating) ? game : max, gamesData[0]);
    if (heroGame) {
        heroContainer.innerHTML = createHeroCard(heroGame);
    }
}

function renderSpecialSections() {
    const highDiscountContainer = document.getElementById('highDiscountContainer');
    const popularContainer = document.getElementById('popularContainer');
    
    // Ensure the containers exist before trying to populate them
    if (!highDiscountContainer || !popularContainer) return;

    highDiscountContainer.innerHTML = '';
    popularContainer.innerHTML = '';

    // Get games with high savings (e.g., 85% or more)
    const highDiscountGames = [...gamesData]
        .filter(g => parseFloat(g.savings) >= 85)
        .sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings))
        .slice(0, 10);

    // Get games with high Metacritic scores
    const popularGames = [...gamesData]
        .filter(g => parseInt(g.metacriticScore, 10) >= 80)
        .sort((a, b) => parseFloat(b.metacriticScore) - parseFloat(a.metacriticScore))
        .slice(0, 10);
        
    highDiscountGames.forEach(game => highDiscountContainer.appendChild(createGameCard(game, 'small')));
    popularGames.forEach(game => popularContainer.appendChild(createGameCard(game, 'small')));
    
    // Hide the 'Ending Soon' section as we don't have the data for it
    const endingSoonSection = document.getElementById('endingSoonSection');
    if(endingSoonSection) {
      endingSoonSection.style.display = 'none';
    }
}

// --- UI ELEMENT CREATION ---
function createGameCard(game, size = 'normal') {
    const isSmall = size === 'small';
    const card = document.createElement('div');
    card.className = `game-card ${isSmall ? 'game-card-small' : ''}`;
    
    // Use a higher quality image for normal cards
    const imageUrl = isSmall ? game.thumb : game.thumb.replace('capsule_231x87', 'header');

    card.innerHTML = \`
        <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank" rel="noopener noreferrer">
            <img src="${imageUrl}" alt="${game.title}" class="game-img" loading="lazy">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-prices">
                    <span class="sale-price">${formatKRW(game.salePrice)}</span>
                    <span class="normal-price">${formatKRW(game.normalPrice)}</span>
                </div>
                <div class="game-discount">-${Math.round(game.savings)}%</div>
            </div>
        </a>
    \`;
    return card;
}

function createHeroCard(game) {
    // Use the highest quality image for the hero card
    const heroImageUrl = game.thumb.replace('capsule_231x87', 'library_hero');
    return \`
        <div class="hero-card">
            <a href="https://www.cheapshark.com/redirect?dealID=${game.dealID}" target="_blank" rel="noopener noreferrer">
                <img src="${heroImageUrl}" alt="${game.title}" class="hero-img">
                <div class="hero-overlay">
                    <h2>${game.title}</h2>
                    <p>지금 바로 ${Math.round(game.savings)}% 할인된 가격으로 만나보세요!</p>
                    <div class="hero-prices">
                        <span class="sale-price">${formatKRW(game.salePrice)}</span>
                        <span class="normal-price">${formatKRW(game.normalPrice)}</span>
                    </div>
                </div>
            </a>
        </div>
    \`;
}

// --- UI STATE ---
function showLoading() {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '<div class="loader"></div><p class="loading-text">최고의 할인 상품을 찾고 있습니다...</p>';
}

function hideLoading() {
    // The loading indicator is inside the container that will be populated,
    // so it gets automatically removed when games are rendered.
}

function showError() {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '<div class="error-message">게임을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</div>';
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
});

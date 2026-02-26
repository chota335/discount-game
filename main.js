document.addEventListener('DOMContentLoaded', () => {
    const dealsContainer = document.getElementById('deals-container');
    const navButtons = document.querySelectorAll('nav button');
    let activeCategory = 'all';

    async function fetchGames(category) {
        dealsContainer.innerHTML = ''; // Clear existing deals
        try {
            const response = await fetch(`/api/deals/${category}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const games = await response.json();
            displayGames(games);
        } catch (error) {
            console.error("Error fetching games:", error);
            dealsContainer.innerHTML = `<p class="error">Failed to load deals. Please try again later.</p>`;
        }
    }

    function displayGames(games) {
        if (!games || games.length === 0) {
            dealsContainer.innerHTML = '<p>No deals found for this category.</p>';
            return;
        }

        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'deal-card';
            gameCard.onclick = () => window.open(`https://store.steampowered.com/app/${game.steamAppID}/?l=koreana`, '_blank');

            const discountPercent = Math.round(parseFloat(game.savings));

            gameCard.innerHTML = `
                <img src="${game.thumb}" alt="${game.title}">
                <div class="deal-info">
                    <div class="deal-title">${game.title}</div>
                    <div class="deal-prices">
                        <span class="original-price">$${game.normalPrice}</span>
                        <span class="sale-price">$${game.salePrice}</span>
                    </div>
                    <div class="deal-savings">-${discountPercent}%</div>
                </div>
            `;
            dealsContainer.appendChild(gameCard);
        });
    }

    function handleNavClick(e) {
        const newCategory = e.target.id.replace('-btn', '');
        if (newCategory !== activeCategory) {
            activeCategory = newCategory;
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            fetchGames(activeCategory);
        }
    }

    navButtons.forEach(button => button.addEventListener('click', handleNavClick));

    // Initial fetch
    fetchGames(activeCategory);
});

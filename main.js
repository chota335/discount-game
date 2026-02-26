document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Element Selectors ---
    const genreGrid = document.getElementById('genreGrid');
    const dealsContainer = document.getElementById('deals-container');
    const loading = document.getElementById('loading');
    const pageHeader = document.querySelector('.page-header h1');
    const filterNav = document.getElementById('filter-nav');

    // --- Page-based Routing ---
    if (genreGrid) {
        await loadMainPage();
    } else if (dealsContainer) {
        await loadDealsPage();
    }

    // --- Main Page Logic: Load Genres ---
    async function loadMainPage() {
        try {
            const response = await fetch('/genres');
            if (!response.ok) throw new Error('장르 데이터를 불러오지 못했습니다.');
            const genres = await response.json();

            if (loading) loading.style.display = 'none';
            if (genreGrid) genreGrid.style.display = 'grid';

            genres.forEach(genre => {
                const card = document.createElement('div');
                card.className = 'genre-card';
                card.innerHTML = `
                    <div class="genre-emoji">${genre.emoji}</div>
                    <div class="genre-name">${genre.name}</div>
                `;
                // ✅ Updated to navigate to the generic deals page
                card.addEventListener("click", () => {
                    window.location.href = `deals.html`;
                });
                genreGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching genres:', error);
            if (loading) loading.textContent = '❌ 장르 목록을 불러오는 데 실패했습니다.';
        }
    }

    // --- Deals Page Logic (Simplified) ---
    async function loadDealsPage() {
        if (pageHeader) pageHeader.textContent = '현재 할인 중인 게임';
        if (filterNav) filterNav.style.display = 'none'; // Hide unused filter bar
        if (loading) loading.style.display = 'block';

        try {
            // ✅ Simplified to fetch from the /deals endpoint
            const response = await fetch('/deals');
            if (!response.ok) throw new Error('할인 데이터를 불러오지 못했습니다.');
            const deals = await response.json();

            if (loading) loading.style.display = 'none';
            renderDeals(deals);

        } catch (error) {
            console.error('Error loading deals page:', error);
            if (loading) loading.innerHTML = '<div class="error">❌ 데이터를 불러오는 데 실패했습니다.</div>';
        }
    }

    // --- Function to Render Deal Cards ---
    function renderDeals(deals) {
        if (!dealsContainer) return;
        dealsContainer.innerHTML = '';

        if (deals.length === 0) {
            dealsContainer.innerHTML = '<div class="no-deals">현재 진행 중인 할인 상품이 없습니다.</div>';
            return;
        }

        deals.forEach(deal => {
            const card = document.createElement('a');
            card.href = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
            card.className = 'deal-card';
            card.target = '_blank';
            card.innerHTML = `
                <img src="${deal.thumb}" alt="${deal.title}" class="deal-thumb">
                <div class="deal-info">
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-meta">
                        <span class="metacritic-score">Metacritic: ${deal.metacriticScore}</span>
                        <span class="steam-rating">Steam: ${deal.steamRatingPercent}%</span>
                    </div>
                </div>
                <div class="deal-pricing">
                    <div>
                        <span class="sale-price">$${deal.salePrice}</span>
                        <span class="normal-price">$${deal.normalPrice}</span>
                    </div>
                    <span class="savings-badge">-${Math.round(deal.savings)}%</span>
                </div>
            `;
            dealsContainer.appendChild(card);
        });
    }
});

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
                // ✅ Changed to event listener and updated URL parameter to 'g'
                card.addEventListener("click", () => {
                    window.location.href = `deals.html?g=${genre.id}`;
                });
                genreGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching genres:', error);
            if (loading) loading.textContent = '❌ 장르 목록을 불러오는 데 실패했습니다.';
        }
    }

    // --- Deals Page Logic: Load Genres and Deals ---
    async function loadDealsPage() {
        // ✅ Changed to read 'g' parameter
        const urlParams = new URLSearchParams(window.location.search);
        const genreId = urlParams.get('g') || 'action';

        if (loading) loading.style.display = 'block';

        try {
            // ✅ Updated API endpoint to /api/deals and parameter to 'g'
            const [genresResponse, dealsResponse] = await Promise.all([
                fetch('/genres'),
                fetch(`/api/deals?g=${genreId}`)
            ]);

            if (!genresResponse.ok) throw new Error('장르 데이터를 불러오지 못했습니다.');
            if (!dealsResponse.ok) throw new Error('할인 데이터를 불러오지 못했습니다.');

            const genres = await genresResponse.json();
            const deals = await dealsResponse.json();

            const currentGenre = genres.find(g => g.id === genreId);
            if (pageHeader && currentGenre) {
                pageHeader.textContent = `${currentGenre.emoji} ${currentGenre.name} 게임 할인`;
            }
            
            renderGenreFilters(genres, genreId);

            if (loading) loading.style.display = 'none';
            renderDeals(deals);

        } catch (error) {
            console.error('Error loading deals page:', error);
            if (loading) loading.innerHTML = '<div class="error">❌ 데이터를 불러오는 데 실패했습니다.</div>';
        }
    }

    // --- 📄 Refactored Function: Render Genre Filters ---
    function renderGenreFilters(genres, activeGenreId) {
        if (!filterNav) return;
        filterNav.innerHTML = ''; 
        genres.forEach(genre => {
            const button = document.createElement('button');
            button.textContent = genre.name;
            button.className = (genre.id === activeGenreId) ? 'active' : '';
            // ✅ Updated URL parameter to 'g'
            button.onclick = () => {
                window.location.href = `deals.html?g=${genre.id}`;
            };
            filterNav.appendChild(button);
        });
    }

    // --- 📄 Refactored Function: Render Deal Cards ---
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

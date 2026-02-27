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
            const response = await fetch('/api/genres'); 
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
                card.addEventListener("click", () => {
                    window.location.href = `genre.html?g=${genre.id}`;
                });
                genreGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching genres:', error);
            if (loading) loading.textContent = '❌ 장르 목록을 불러오는 데 실패했습니다.';
        }
    }

    // --- Deals Page Logic ---
    async function loadDealsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        let currentGenre = urlParams.get('g') || 'action';
        let searchQuery = urlParams.get('q') || '';
        let sortBy = urlParams.get('sortBy') || 'popularity';
        let maxPrice = urlParams.get('maxPrice') || '50';
        let metacritic = urlParams.get('metacritic') || '0';

        // --- Filter UI Element Selectors ---
        const searchInput = document.getElementById('search-input');
        const sortBySelect = document.getElementById('sort-by');
        const maxPriceSlider = document.getElementById('max-price');
        const maxPriceValue = document.getElementById('max-price-value');
        const metacriticInput = document.getElementById('metacritic-score');

        // --- Initialize Filter UI ---
        if (searchInput) searchInput.value = searchQuery;
        if (sortBySelect) sortBySelect.value = sortBy;
        if (maxPriceSlider) maxPriceSlider.value = maxPrice;
        if (maxPriceValue) maxPriceValue.textContent = maxPrice;
        if (metacriticInput) metacriticInput.value = metacritic > 0 ? metacritic : '';

        if (loading) loading.style.display = 'block';

        try {
            const genresResponse = await fetch('/api/genres');
            if (!genresResponse.ok) throw new Error('장르 데이터를 불러오지 못했습니다.');
            const genres = await genresResponse.json();

            renderGenreFilters(genres, currentGenre);
            updatePageTitle(genres, currentGenre);
            await fetchAndRenderDeals();

        } catch (error) {
            console.error('Error loading deals page:', error);
            if (loading) loading.innerHTML = '<div class="error">❌ 데이터를 불러오는 데 실패했습니다.</div>';
        }

        // --- Event Listeners for Filters ---
        function setupFilterEventListeners() {
            const applyFilters = () => {
                searchQuery = searchInput ? searchInput.value : '';
                sortBy = sortBySelect ? sortBySelect.value : 'popularity';
                maxPrice = maxPriceSlider ? maxPriceSlider.value : '50';
                metacritic = metacriticInput ? (metacriticInput.value || '0') : '0';
                
                // Update URL and fetch deals
                updateURLAndFetch();
            };
            
            let debounceTimer;
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(applyFilters, 500); // Debounce search input
                });
            }
            if (sortBySelect) sortBySelect.addEventListener('change', applyFilters);
            if (maxPriceSlider) {
                maxPriceSlider.addEventListener('input', () => {
                    if(maxPriceValue) maxPriceValue.textContent = maxPriceSlider.value;
                });
                maxPriceSlider.addEventListener('change', applyFilters);
f            }
            if(metacriticInput) {
                metacriticInput.addEventListener('change', applyFilters);
            }
        }
        
        function updateURLAndFetch() {
            const params = new URLSearchParams();
            params.set('g', currentGenre);
            if (searchQuery) params.set('q', searchQuery);
            if (sortBy !== 'popularity') params.set('sortBy', sortBy);
            if (maxPrice !== '50') params.set('maxPrice', maxPrice);
            if (metacritic !== '0') params.set('metacritic', metacritic);

            // Update URL without reloading the page
            history.pushState(null, '', `?${params.toString()}`);
            fetchAndRenderDeals();
        }


        // --- Fetch and Render Deals ---
        async function fetchAndRenderDeals() {
            if (loading) loading.style.display = 'block';
            if (dealsContainer) dealsContainer.innerHTML = '';

            const apiUrl = `/api/deals?g=${currentGenre}&q=${searchQuery}&sortBy=${sortBy}&maxPrice=${maxPrice}&metacritic=${metacritic}`;

            try {
                const dealsResponse = await fetch(apiUrl);
                if (!dealsResponse.ok) throw new Error('할인 데이터를 불러오지 못했습니다.');
                const deals = await dealsResponse.json();

                if (loading) loading.style.display = 'none';
                renderDeals(deals);
            } catch (error) {
                 console.error('Error fetching deals:', error);
                 if (loading) loading.innerHTML = '<div class="error">❌ 할인 정보를 불러오는 데 실패했습니다.</div>';
            }
        }
        setupFilterEventListeners();
    }

    // --- Helper Functions ---
    function updatePageTitle(genres, activeGenreId) {
        const currentGenre = genres.find(g => g.id === activeGenreId);
        if (pageHeader && currentGenre) {
            pageHeader.textContent = `${currentGenre.emoji} ${currentGenre.name} 게임 할인`;
            document.title = `${currentGenre.name} 게임 할인 | 🔥 스팀 할인`;
        }
    }

    function renderGenreFilters(genres, activeGenreId) {
        if (!filterNav) return;
        filterNav.innerHTML = '';
        genres.forEach(genre => {
            const button = document.createElement('a'); // Use links for better SPA-like navigation
            button.href = `genre.html?g=${genre.id}`;
            button.textContent = genre.name;
            button.className = (genre.id === activeGenreId) ? 'active' : '';
            
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent full page reload
                history.pushState(null, '', button.href); // Update URL
                // Re-initialize the deals page content
                loadDealsPage();
            });
            filterNav.appendChild(button);
        });
    }

    function renderDeals(deals) {
        if (!dealsContainer) return;
        dealsContainer.innerHTML = '';

        if (deals.length === 0) {
            dealsContainer.innerHTML = '<div class="no-deals">🥲 해당 조건에 맞는 할인 상품이 없습니다.</div>';
            return;
        }

        deals.forEach(deal => {
            const card = document.createElement('a');
            card.href = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
            card.className = 'deal-card';
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            
            const savingsPercent = Math.round(parseFloat(deal.savings));
            const metacriticScore = deal.metacriticScore || 'N/A';
            const steamRating = deal.steamRatingPercent || 'N/A';

            card.innerHTML = `
                <img src="${deal.thumb}" alt="${deal.title}" class="deal-thumb" loading="lazy">
                <div class="deal-info">
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-meta">
                        <span class="metacritic-score">Metascore: ${metacriticScore}</span>
                        <span class="steam-rating">Steam: ${steamRating}%</span>
                    </div>
                </div>
                <div class="deal-pricing">
                    <div class="price-tags">
                        <span class="sale-price">$${deal.salePrice}</span>
                        <span class="normal-price">$${deal.normalPrice}</span>
                    </div>
                    ${savingsPercent > 0 ? `<span class="savings-badge">-${savingsPercent}%</span>` : ''}
                </div>
            `;
            dealsContainer.appendChild(card);
        });
    }
});

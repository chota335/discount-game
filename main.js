document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const dealsContainer = document.getElementById('deals-container');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('search-input');
    const filterAllBtn = document.getElementById('filter-all');
    const filterAaaBtn = document.getElementById('filter-aaa');

    let currentFilter = 'all'; // 'all' or 'aaa'
    let searchQuery = '';
    let debounceTimer;

    // --- Main Function to Fetch and Render Deals ---
    const fetchAndRenderDeals = async () => {
        if (loading) loading.style.display = 'block';
        if (dealsContainer) dealsContainer.innerHTML = '';

        // Construct API URL based on current filters
        const params = new URLSearchParams();
        if (searchQuery) {
            params.append('q', searchQuery);
        }
        if (currentFilter === 'aaa') {
            params.append('filter', 'aaa');
        }
        
        const apiUrl = `/api/deals?${params.toString()}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const deals = await response.json();

            if (loading) loading.style.display = 'none';
            renderDeals(deals);

        } catch (error) {
            console.error('Error fetching deals:', error);
            if (loading) {
                loading.innerHTML = '<div class="error">❌ 할인 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</div>';
            }
        }
    };

    // --- Render Deals on the Page ---
    const renderDeals = (deals) => {
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

            card.innerHTML = `
                <img src="${deal.thumb}" alt="${deal.title}" class="deal-thumb" loading="lazy">
                <div class="deal-info">
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-meta">
                        <span class="metacritic-score">Metascore: ${metacriticScore}</span>
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
    };

    // --- Event Listeners ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            searchQuery = e.target.value;
            debounceTimer = setTimeout(() => {
                fetchAndRenderDeals();
            }, 500); // Debounce for 500ms
        });
    }

    filterAllBtn?.addEventListener('click', () => {
        if (currentFilter === 'all') return;
        currentFilter = 'all';
        filterAllBtn.classList.add('active');
        filterAaaBtn.classList.remove('active');
        fetchAndRenderDeals();
    });

    filterAaaBtn?.addEventListener('click', () => {
        if (currentFilter === 'aaa') return;
        currentFilter = 'aaa';
        filterAaaBtn.classList.add('active');
        filterAllBtn.classList.remove('active');
        fetchAndRenderDeals();
    });

    // --- Initial Load ---
    fetchAndRenderDeals();
});

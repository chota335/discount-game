document.addEventListener('DOMContentLoaded', () => {
    const dealsContainer = document.getElementById('deals-container');
    const loading = document.getElementById('loading');
    const pageTitle = document.getElementById('deals-page-title');
    const filterNav = document.querySelector('.filter-nav');

    const urlParams = new URLSearchParams(window.location.search);
    let activeGenre = urlParams.get('genre') || 'all';
    let activeSort = 'savings';

    // Friendly names for genres to be used in titles
    const genreDisplayNames = {
        'action': '액션', 'rpg': 'RPG', 'strategy': '전략',
        'adventure': '어드벤처', 'simulation': '시뮬레이션',
        'sports_racing': '스포츠 & 레이싱', 'indie': '인디', 'casual': '캐주얼',
        'open_world': '오픈월드', 'horror': '공포', 'sci_fi': 'SF', 'fantasy': '판타지'
    };

    function updateTitle() {
        const genreName = genreDisplayNames[activeGenre] || '모든';
        const title = `${genreName} 게임 할인 정보`;
        document.title = title + ' | DiscountDealGame';
        pageTitle.textContent = title;
    }

    async function fetchAndDisplayDeals() {
        if (!dealsContainer) return;
        loading.style.display = 'block';
        dealsContainer.innerHTML = '';

        try {
            const response = await fetch(`/functions/deals?genre=${activeGenre}&sort=${activeSort}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const deals = await response.json();
            
            loading.style.display = 'none';
            renderDeals(deals);

        } catch (error) {
            console.error('Fetch error:', error);
            loading.innerHTML = '<p class="error">할인 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</p>';
        }
    }

    function renderDeals(deals) {
        if (deals.length === 0) {
            dealsContainer.innerHTML = '<p class="no-deals">현재 이 카테고리에는 진행 중인 할인이 없습니다.</p>';
            return;
        }

        deals.forEach(deal => {
            const dealCard = document.createElement('a');
            dealCard.className = 'deal-card';
            dealCard.href = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
            dealCard.target = '_blank';
            dealCard.rel = 'noopener noreferrer';

            const savings = Math.round(parseFloat(deal.savings));

            dealCard.innerHTML = `
                <img src="${deal.thumb}" alt="${deal.title}" class="deal-thumb" loading="lazy">
                <div class="deal-info">
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-meta">
                        <span class="metacritic-score">Metascore: ${deal.metacriticScore || 'N/A'}</span>
                        <span class="steam-rating">Steam: ${deal.steamRatingPercent || 'N/A'}%</span>
                    </div>
                </div>
                <div class="deal-pricing">
                    <span class="sale-price">$${deal.salePrice}</span>
                    <span class="normal-price">$${deal.normalPrice}</span>
                    <span class="savings-badge">${savings}%</span>
                </div>
            `;
            dealsContainer.appendChild(dealCard);
        });
    }

    filterNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newSort = e.target.id.replace('-btn', '');
            if (newSort !== activeSort) {
                document.querySelector('.filter-nav .active').classList.remove('active');
                e.target.classList.add('active');
                activeSort = newSort;
                fetchAndDisplayDeals();
            }
        }
    });

    updateTitle();
    fetchAndDisplayDeals();
});
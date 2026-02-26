document.addEventListener('DOMContentLoaded', () => {
    // Element selections
    const dealsContainer = document.getElementById('deals-container');
    const navButtons = document.querySelectorAll('nav button');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalBody = document.getElementById('modal-body');
    const modalCloseButton = document.getElementById('modal-close-button');
    const aboutLink = document.getElementById('about-link');
    const privacyLink = document.getElementById('privacy-link');
    const privacyLinkBanner = document.getElementById('privacy-link-banner');
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const consentButton = document.getElementById('consent-button');

    let activeCategory = 'all';

    // --- Content for Modals ---
    const aboutContent = `
        <h2>About DiscountDealGame</h2>
        <p>DiscountDealGame은 최고의 스팀 게임 할인을 찾을 수 있도록 도와주는 웹사이트입니다.</p>
        <p>모든 게임 데이터는 <a href="https://www.cheapshark.com/api" target="_blank">CheapShark API</a>를 통해 제공됩니다. 이 API는 다양한 디지털 PC 게임 스토어의 가격 정보를 제공하여 사용자가 최고의 거래를 찾을 수 있도록 돕습니다.</p>
        <p>게임을 클릭하면 공식 Steam 상점 페이지로 이동하여 안전하게 구매할 수 있습니다.</p>
    `;

    const privacyContent = `
        <h2>개인정보처리방침</h2>
        <p>본 사이트는 서비스 개선 및 맞춤형 광고 제공을 위해 쿠키를 사용합니다.</p>
        <h3>쿠키 사용</h3>
        <p>쿠키는 사용자의 웹사이트 방문 기록을 저장하는 작은 텍스트 파일입니다. 본 사이트는 쿠키를 통해 다음과 같은 정보를 수집하고 활용합니다.</p>
        <ul>
            <li><strong>분석 쿠키:</strong> 사이트 이용 현황을 파악하여 사용자 경험을 개선하는 데 사용됩니다. (예: Google Analytics)</li>
            <li><strong>광고 쿠키:</strong> 사용자에게 더 관련성 높은 광고를 제공하기 위해 사용됩니다. (예: Google AdSense)</li>
        </ul>
        <h3>Google AdSense</h3>
        <p>본 사이트는 Google AdSense를 통해 광고를 표시합니다. Google 및 Google의 파트너는 DoubleClick 쿠키를 사용하여 사용자의 이전 방문 기록을 기반으로 맞춤형 광고를 제공할 수 있습니다.</p>
        <p>사용자는 <a href="https://www.google.com/settings/ads" target="_blank">Google 광고 설정</a>에서 맞춤형 광고를 선택 해제할 수 있습니다.</p>
        <p>Google의 개인정보처리방침에 대한 자세한 내용은 <a href="https://policies.google.com/privacy" target="_blank">여기</a>에서 확인하실 수 있습니다.</p>
        <h3>쿠키 동의</h3>
        <p>사이트를 계속 이용하면 쿠키 사용에 동의하는 것으로 간주됩니다. 쿠키 기본 설정은 브라우저 설정에서 언제든지 변경할 수 있습니다.</p>
    `;

    // --- API and Game Display Functions ---
    async function fetchGames(category) {
        dealsContainer.innerHTML = '<p class="loading">Loading deals...</p>';
        try {
            // Use a proxy to bypass CORS issues, which is handled by Cloudflare Workers
            const apiUrl = `https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=30&sortBy=${getSortBy(category)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const deals = await response.json();
            displayGames(deals);
        } catch (error) {
            console.error("Error fetching games:", error);
            dealsContainer.innerHTML = `<p class="error">Failed to load deals. Please try again later.</p>`;
        }
    }

    function getSortBy(category) {
        switch (category) {
            case 'metacritic': return 'Metacritic';
            case 'reviews': return 'Reviews';
            case 'aaa': return 'Price'; // A proxy for AAA, as API doesn't have a direct filter
            default: return 'Savings';
        }
    }

    function displayGames(deals) {
        if (!deals || deals.length === 0) {
            dealsContainer.innerHTML = '<p>No deals found for this category.</p>';
            return;
        }
        dealsContainer.innerHTML = ''; // Clear loading message

        deals.forEach(deal => {
            const dealCard = document.createElement('div');
            dealCard.className = 'deal-card';
            dealCard.onclick = () => window.open(`https://store.steampowered.com/app/${deal.steamAppID}/`, '_blank');

            const discountPercent = Math.round(parseFloat(deal.savings));

            dealCard.innerHTML = `
                <img src="${deal.thumb}" alt="${deal.title}" loading="lazy">
                <div class="deal-info">
                    <div class="deal-title">${deal.title}</div>
                    <div class="deal-prices">
                        <span class="original-price">$${deal.normalPrice}</span>
                        <span class="sale-price">$${deal.salePrice}</span>
                    </div>
                </div>
            `;
            dealsContainer.appendChild(dealCard);
        });
    }

    // --- Modal Functions ---
    function openModal(content) {
        modalBody.innerHTML = content;
        modalOverlay.style.display = 'flex';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
    }

    // --- Cookie Consent Functions ---
    function handleCookieConsent() {
        // Use localStorage for simplicity as it's a client-side preference
        if (!localStorage.getItem('cookieConsent')) {
            cookieBanner.classList.add('show');
        }

        consentButton.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBanner.classList.remove('show');
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const newCategory = e.target.id.replace('-btn', '');
                if (newCategory !== activeCategory) {
                    activeCategory = newCategory;
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    fetchGames(activeCategory);
                }
            });
        });

        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(aboutContent);
        });

        const openPrivacyModal = (e) => {
            e.preventDefault();
            openModal(privacyContent);
        };

        privacyLink.addEventListener('click', openPrivacyModal);
        privacyLinkBanner.addEventListener('click', openPrivacyModal);

        modalCloseButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- Initialization ---
    setupEventListeners();
    handleCookieConsent();
    fetchGames(activeCategory); // Initial fetch
});
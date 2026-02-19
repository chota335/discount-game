document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('gamesContainer');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const loadingSpinner = document.getElementById('loadingSpinner');
    let allGames = [];

    // --- Firebase 초기화 --- 
    // 나중에 Firebase 프로젝트 설정 후 실제 값으로 채워집니다.
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    try {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // 데이터 가져오기
        fetchGamesFromFirestore();

    } catch (e) {
        console.error("Firebase 초기화에 실패했습니다. Firebase 설정이 올바른지 확인하세요.", e);
        gamesContainer.innerHTML = '<p>데이터를 불러올 수 없습니다. Firebase 설정을 확인해주세요.</p>';
        showSpinner(false);
    }

    function showSpinner(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }

    async function fetchGamesFromFirestore() {
        showSpinner(true);
        try {
            const snapshot = await db.collection('steamDeals').orderBy('lastUpdated', 'desc').limit(1).get();
            if (snapshot.empty) {
                gamesContainer.innerHTML = '<p>아직 데이터가 없습니다. 자동 업데이트가 곧 실행됩니다.</p>';
                showSpinner(false);
                return;
            }
            
            // 문서에서 게임 목록을 가져옴
            const data = snapshot.docs[0].data();
            allGames = data.games || [];

            applyFiltersAndSort();

        } catch (error) {
            console.error("Firestore에서 데이터를 가져오는 중 오류 발생:", error);
            gamesContainer.innerHTML = '<p>데이터를 가져오는 데 실패했습니다.</p>';
        } finally {
            showSpinner(false);
        }
    }

    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        let filteredGames = allGames.filter(game => 
            game.title.toLowerCase().includes(searchTerm)
        );

        let sortedGames = [...filteredGames].sort((a, b) => {
            if (sortBy === 'savings') return b.savings - a.savings;
            if (sortBy === 'salePrice') return a.salePrice - b.salePrice;
            if (sortBy === 'title') return a.title.localeCompare(b.title);
        });

        renderGames(sortedGames);
    }

    function renderGames(games) {
        gamesContainer.innerHTML = '';
        if (games.length === 0) {
            gamesContainer.innerHTML = '<p>표시할 게임이 없습니다.</p>';
            return;
        }

        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.classList.add('game-card');

            const genresHtml = game.genres.length > 0
                ? `<div class="genres">${game.genres.slice(0, 2).map(g => `<span class="genre-tag">${g}</span>`).join('')}</div>`
                : '<div class="genres"></div>';

            gameCard.innerHTML = `
                <img src="${game.thumb}" alt="${game.title}">
                <div class="game-info">
                    <div>
                        <h3>${game.title}</h3>
                        ${genresHtml}
                    </div>
                    <div class="price-info">
                        <div class="price">₩${game.salePrice.toLocaleString('ko-KR')}</div>
                        <div class="original-price">₩${game.normalPrice.toLocaleString('ko-KR')}</div>
                        <div class="discount">-${game.savings}%</div>
                    </div>
                </div>
            `;

            if (game.steamAppID) {
                gameCard.addEventListener('click', () => {
                    window.open(`https://store.steampowered.com/app/${game.steamAppID}`, '_blank');
                });
            }

            gamesContainer.appendChild(gameCard);
        });
    }

    searchInput.addEventListener('input', applyFiltersAndSort);
    sortSelect.addEventListener('change', applyFiltersAndSort);
});

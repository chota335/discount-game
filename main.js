document.addEventListener('DOMContentLoaded', async () => {
    const genreGrid = document.getElementById('genreGrid');
    const loading = document.getElementById('loading');

    try {
        const response = await fetch('/functions/genres');
        if (!response.ok) throw new Error('장르 데이터를 불러오지 못했습니다.');
        const genres = await response.json();

        loading.style.display = 'none';
        genreGrid.style.display = 'grid';

        genres.forEach(genre => {
            const card = document.createElement('a');
            card.href = `/deals.html?genre=${genre.id}`;
            card.className = 'genre-card';
            card.innerHTML = `
                <div class="genre-emoji">${genre.emoji}</div>
                <div class="genre-name">${genre.name}</div>
            `;
            genreGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching genres:', error);
        loading.textContent = '장르 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.';
    }
});
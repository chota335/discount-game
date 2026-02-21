
const API_URL = "./data.json";

async function fetchGamesForDebug() {
    const container = document.getElementById('gamesContainer');
    
    // 1. Check if the target container exists
    if (!container) {
        document.body.innerHTML = '<h1 style="color:red; text-align:center;">Critical Error: HTML element with ID "gamesContainer" was not found.</h1>';
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;">[1/3] 데이터를 불러오는 중...</p>';

    try {
        // 2. Try to fetch the file
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        
        container.innerHTML = '<p style="text-align:center;">[2/3] 데이터를 파싱하는 중...</p>';
        const data = await response.json();

        // 3. Check if the data is a valid array
        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = `
                <p style="color:green; text-align:center;">[3/3] 성공!</p>
                <p style="text-align:center;">총 ${data.length}개의 게임 데이터를 찾았습니다.</p>
                <p style="text-align:center;">첫 번째 게임 제목: ${data[0].title}</p>
            `;
        } else {
            container.innerHTML = '<p style="color:orange; text-align:center;">[3/3] 데이터는 찾았지만, 내용이 비어있거나 배열이 아닙니다.</p>';
        }

    } catch (error) {
        container.innerHTML = `
            <p style="color:red; text-align:center;">오류 발생!</p>
            <p style="text-align:center;">아래 오류 메시지를 확인해주세요:</p>
            <pre style="white-space: pre-wrap; word-wrap: break-word; background: #f0f0f0; padding: 10px; border-radius: 5px;">${error.toString()}</pre>
        `;
        console.error("Debug Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchGamesForDebug();
});

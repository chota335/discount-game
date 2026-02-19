const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const db = admin.firestore();
const EXCHANGE_RATE_KRW = 1300; 

// 매일 자정에 실행되는 함수 (한국 시간 기준)
exports.updateGameDeals = functions.region('asia-northeast3').pubsub.schedule('0 0 * * *')
    .timeZone('Asia/Seoul') 
    .onRun(async (context) => {
        console.log('Executing scheduled game deals update...');

        try {
            // 1. 10% 이상 할인 중인 게임 목록(Deals) 가져오기
            const dealsResponse = await axios.get('https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&minSavings=10&pageSize=60');
            const deals = dealsResponse.data;

            if (deals.length === 0) {
                console.log("No deals found meeting the criteria.");
                return null;
            }

            // 2. 각 게임의 상세 정보(장르 포함) 병렬 요청
            const gameInfoPromises = deals.map(deal => 
                axios.get(`https://www.cheapshark.com/api/1.0/games?id=${deal.gameID}`)
            );
            const gameInfoResponses = await Promise.all(gameInfoPromises);
            const gamesInfo = gameInfoResponses.map(res => res.data);

            // 3. 할인 정보와 상세 정보 합치기 및 데이터 가공
            const processedGames = deals.map(deal => {
                const gameInfo = gamesInfo.find(info => info.info.title === deal.title);
                return {
                    title: deal.title,
                    steamAppID: deal.steamAppID,
                    thumb: deal.thumb,
                    salePrice: Math.floor(parseFloat(deal.salePrice) * EXCHANGE_RATE_KRW),
                    normalPrice: Math.floor(parseFloat(deal.normalPrice) * EXCHANGE_RATE_KRW),
                    savings: Math.round(parseFloat(deal.savings)),
                    genres: gameInfo?.genres || [],
                };
            });

            // 4. Firestore에 결과 저장
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            await db.collection('steamDeals').doc(today).set({
                games: processedGames,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Successfully updated ${processedGames.length} game deals for ${today}.`);
            return null;

        } catch (error) {
            console.error('Error updating game deals:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            return null;
        }
    });

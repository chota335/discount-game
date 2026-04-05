const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.deals = functions.https.onRequest(async (request, response) => {
  const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=100";
  const res = await fetch(url);
  const data = await res.json();
  response.set("Access-Control-Allow-Origin", "*");
  response.json(data);
});

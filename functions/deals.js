export async function onRequest() {
  const response = await fetch(
    "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=100"
  );

  const data = await response.text();

  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
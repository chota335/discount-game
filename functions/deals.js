export async function onRequest(context) {
  const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=100";

  const res = await fetch(url);
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
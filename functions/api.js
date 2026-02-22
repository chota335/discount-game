export async function onRequest(context) {
  const url = new URL(context.request.url);
  const page = url.searchParams.get("page") || "0";

  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=100&page=${page}`
  );

  const data = await response.text();

  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

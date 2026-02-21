export async function onRequest(context) {
  const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API fetch failed with status: ${response.status}`);
    }
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Cloudflare Function Error:", error);
    const errorResponse = {
      error: "데이터를 불러오는 데 실패했습니다.",
      details: error.message
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

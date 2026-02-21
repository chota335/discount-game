
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const dealID = url.searchParams.get("dealID");

    if (!dealID) {
      return new Response("Missing dealID", { status: 400 });
    }

    // 기존 클릭수 가져오기
    const current = await env.CLICKS.get(dealID);
    const count = current ? parseInt(current) + 1 : 1;

    // 저장
    await env.CLICKS.put(dealID, count.toString());

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

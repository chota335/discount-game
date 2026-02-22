export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const appids = searchParams.get('appids');

  if (!appids) {
    return new Response('Missing appids query parameter', { status: 400 });
  }

  const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appids}&filters=genres&l=koreana`;
  const response = await fetch(steamUrl);

  if (!response.ok) {
    return new Response('Failed to fetch from Steam API', { status: response.status });
  }

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

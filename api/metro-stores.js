export default async function handler(req, res) {
  const params = new URLSearchParams({
    s: '{0F3B38A3-7330-4544-B95B-81FC80A6BB6F}',
    sig: 'store-locator',
    p: '30',
    v: '{BECE07BD-19B3-4E41-9C8F-E9D9EC85574F}',
    itemid: '{871024E5-B25D-4FFD-8AF1-29C3FDF1DD11}',
    o: 'Distance,Ascending',
    g: '49.0,31.0',
  });

  const upstream = await fetch(`https://www.metro.ua/sxa/search/results?${params}`, {
    headers: {
      'Accept': 'application/json, text/javascript, */*',
      'Accept-Language': 'uk-UA,uk;q=0.9',
      'Referer': 'https://www.metro.ua/uk/stores',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  const text = await upstream.text();
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  res.status(upstream.status).end(text);
}

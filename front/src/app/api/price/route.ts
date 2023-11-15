export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const ids = searchParams.get("ids");
  const currencies = searchParams.get("currencies");

  const { isCached, priceCached } = getFromCache(ids, currencies);
  if (isCached) {
    return Response.json({ ethereum: JSON.parse(priceCached).ethereum });
  }

  const price = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`,
  );

  const priceJson = await price.json();

  saveToCache(ids, currencies, priceJson);

  return Response.json({ ethereum: priceJson.ethereum });
}

const cache = new Map();

function saveToCache(
  ids: string | null,
  currencies: string | null,
  priceJson: Response | null,
): void {
  const key = `${ids}-${currencies}`;
  // save to cache
  cache.set(key, JSON.stringify({ ...priceJson, timestamp: Date.now() }));
}

function getFromCache(
  ids: string | null,
  currencies: string | null,
): { isCached: boolean; priceCached: string } {
  try {
    const key = `${ids}-${currencies}`;
    // retrieve from cache
    const priceCached = cache.get(key);
    const priceCachedJson = JSON.parse(priceCached);

    const timestamp = priceCachedJson.timestamp;
    const now = Date.now();
    // cache for 1 minute
    if (now - timestamp > 1 * 60 * 1000) {
      return { isCached: false, priceCached: "" };
    }
    return { isCached: true, priceCached };
  } catch (e) {
    return { isCached: false, priceCached: "" };
  }
}

import { stringify } from "viem";
import fs from "fs";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const ids = searchParams.get("ids");
  const currencies = searchParams.get("currencies");

  const { isCached, priceCached } = getFromCache(ids, currencies);
  if (isCached) {
    return Response.json(JSON.parse(priceCached));
  }

  const price = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`,
  );

  const priceJson = await price.json();

  saveToCache(ids, currencies, priceJson);

  return Response.json(JSON.parse(stringify(priceJson)));
}

function saveToCache(
  ids: string | null,
  currencies: string | null,
  priceJson: Response | null,
): void {
  const key = `${ids}-${currencies}`;
  // create cache folder if not exist
  if (!fs.existsSync("./cache")) {
    fs.mkdirSync("./cache");
  }
  // save to local files
  fs.writeFileSync(`./cache/${key}.json`, JSON.stringify({ ...priceJson, timestamp: Date.now() }));
}

function getFromCache(
  ids: string | null,
  currencies: string | null,
): { isCached: boolean; priceCached: string } {
  const key = `${ids}-${currencies}`;
  // retrieve from local files
  try {
    const priceCached = fs.readFileSync(`./cache/${key}.json`, "utf8");
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

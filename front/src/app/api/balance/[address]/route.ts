import { Hex, stringify } from "viem";

export async function GET(_req: Request, { params }: { params: { address: Hex } }) {
  const { address } = params;
  if (!address) {
    return Response.json(JSON.parse(stringify({ error: "address is required" })));
  }
  const result = await fetch(
    `https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`,
    { cache: "no-store" },
  );
  const resultJSON = await result.json();
  const balance = BigInt(resultJSON?.result || 0);

  return Response.json(JSON.parse(stringify({ balance })));
}

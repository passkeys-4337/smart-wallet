import { PUBLIC_CLIENT } from "@/constants/client";
import { FACTORY_ABI } from "@/constants/factory";
import { Hex, createPublicClient, stringify, toHex, fallback, http } from "viem";
import { sepolia } from "viem/chains";

export async function GET(_req: Request, { params }: { params: { id: Hex } }) {
  const { id } = params;
  if (!id) {
    return Response.json(JSON.parse(stringify({ error: "id is required" })));
  }

  const CLIENT = createPublicClient({
    chain: sepolia,
    transport: fallback([
      http("https://rpc.notadegen.com/eth/sepolia"),
      http("https://gateway.tenderly.co/public/sepolia	"),
    ]),
  });

  const user = await CLIENT.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  const balance = await CLIENT.getBalance({ address: user.account });

  console.log("balance", balance);

  return Response.json(JSON.parse(stringify({ ...user, id: toHex(user.id), balance })));
}

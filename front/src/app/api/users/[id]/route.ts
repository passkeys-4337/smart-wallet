import { FACTORY_ABI, FACTORY_ADDRESS } from "@/constants/factory";
import { Hex, createPublicClient, http, stringify, toHex } from "viem";
import { baseGoerli } from "viem/chains";

export async function GET(_req: Request, { params }: { params: { id: Hex } }) {
  const { id } = params;
  console.log(id);
  if (!id) {
    return Response.json(JSON.parse(stringify({ error: "id is required" })));
  }

  const publicClient = createPublicClient({
    chain: baseGoerli,
    transport: http(),
  });

  const user = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  return Response.json(JSON.parse(stringify({ ...user, id: toHex(user.id) })));
}

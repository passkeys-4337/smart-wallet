import { PUBLIC_CLIENT } from "@/constants/client";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/constants/factory";
import { Hex, stringify, toHex } from "viem";

export async function GET(_req: Request, { params }: { params: { id: Hex } }) {
  const { id } = params;
  if (!id) {
    return Response.json(JSON.parse(stringify({ error: "id is required" })));
  }

  const user = await PUBLIC_CLIENT.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  const balance = await PUBLIC_CLIENT.getBalance({ address: user.account });

  return Response.json(JSON.parse(stringify({ ...user, id: toHex(user.id), balance })));
}

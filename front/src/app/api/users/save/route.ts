import { FACTORY_ABI, FACTORY_ADDRESS } from "@/constants/factory";
import { Hex, createPublicClient, createWalletClient, http, toHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseGoerli } from "viem/chains";

export async function POST(req: Request) {
  const { id, pubKey } = (await req.json()) as { id: Hex; pubKey: [Hex, Hex] };

  const account = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as Hex);
  const walletClient = createWalletClient({
    account,
    chain: baseGoerli,
    transport: http(),
  });

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

  if (user.account !== zeroAddress) {
    return Response.json(undefined);
  }

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "saveUser",
    args: [BigInt(id), pubKey],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const createdUser = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return Response.json({ ...createdUser, id: toHex(createdUser.id) });
}

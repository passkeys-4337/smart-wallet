import { CHAIN } from "@/constants";
import { FACTORY_ABI } from "@/constants/factory";
import { Hex, createPublicClient, createWalletClient, http, toHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export async function POST(req: Request) {
  const { id, pubKey } = (await req.json()) as { id: Hex; pubKey: [Hex, Hex] };

  const account = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as Hex);
  const walletClient = createWalletClient({
    account,
    chain: CHAIN,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: CHAIN,
    transport: http(),
  });

  const user = await publicClient.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  if (user.account !== zeroAddress) {
    return Response.json(undefined);
  }

  const hash = await walletClient.writeContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "saveUser",
    args: [BigInt(id), pubKey],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const createdUser = await publicClient.readContract({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  // send 1 wei to the user
  // so that anyone can send a transaction to the user's smart wallet
  const hash2 = await walletClient.sendTransaction({
    to: createdUser.account,
    value: BigInt(1),
  });

  await publicClient.waitForTransactionReceipt({ hash: hash2 });

  return Response.json({ ...createdUser, id: toHex(createdUser.id) });
}

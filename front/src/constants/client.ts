import { createPublicClient, http } from "viem";
import { baseGoerli, sepolia, mainnet } from "viem/chains";

export const PUBLIC_CLIENT = createPublicClient({
  chain: baseGoerli,
  transport: http(),
});

export const MAINNET_PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(),
});

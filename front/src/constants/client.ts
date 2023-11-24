import { createPublicClient, fallback, http } from "viem";
import { sepolia, mainnet } from "viem/chains";

export const CHAIN = {
  ...sepolia,
};

export const transport = fallback([
  http("https://rpc.notadegen.com/eth/sepolia"),
  http("https://gateway.tenderly.co/public/sepolia	"),
]);

export const PUBLIC_CLIENT = createPublicClient({
  chain: sepolia,
  transport,
});

export const MAINNET_PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(),
});

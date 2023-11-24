import { createPublicClient, fallback, http } from "viem";
import { sepolia, mainnet } from "viem/chains";

export const CHAIN = {
  ...sepolia,
  // rpcUrls: {
  //   ...sepolia.rpcUrls,
  //   default: { http: ["https://rpc.ankr.com/eth_sepolia"] },
  //   public: { http: ["https://rpc.ankr.com/eth_sepolia"] },
  // },
};

export const PUBLIC_CLIENT = createPublicClient({
  chain: sepolia,
  transport: fallback([
    http("https://ethereum-sepolia.publicnode.com"),
    http("https://gateway.tenderly.co/public/sepolia	"),
  ]),
});

export const MAINNET_PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(),
});

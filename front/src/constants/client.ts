import { createPublicClient, http } from "viem";
import { sepolia, mainnet } from "viem/chains";


export const CHAIN = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: { http: ["https://rpc.ankr.com/eth_sepolia"] },
    public: { http: ["https://rpc.ankr.com/eth_sepolia"] },
  },
};

export const PUBLIC_CLIENT = createPublicClient({
  chain: CHAIN,
  transport: http(),
});

export const MAINNET_PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(),
});

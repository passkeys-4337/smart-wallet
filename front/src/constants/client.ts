import { createPublicClient, http } from "viem";
import { baseGoerli } from "viem/chains";

export const PUBLIC_CLIENT = createPublicClient({
  chain: baseGoerli,
  transport: http(),
});

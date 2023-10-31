import { fallback, http } from "viem";

const alchemy = http("https://eth-mainnet.g.alchemy.com/v2/...");
const infura = http("https://mainnet.infura.io/v3/...");

export const transport = fallback([alchemy, infura]);

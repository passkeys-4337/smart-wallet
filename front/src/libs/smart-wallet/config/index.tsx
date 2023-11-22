import { fallback, http } from "viem";

// const publicRpc = http("https://goerli.base.org");
// const localhost = http("http://localhost:8545");
const stackUpBundlerRpcUrl = http(
  `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_API_KEY}`,
);

export const transport = stackUpBundlerRpcUrl;

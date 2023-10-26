import { EIP155_CHAINS } from "./EIP155-data";
import { WCChains } from "./common-types";

export const ALL_CHAINS: WCChains = {
  ...EIP155_CHAINS,
};

export function getChainData(chainId?: string) {
  if (!chainId) return;
  const [namespace, reference] = chainId.toString().split(":");
  return Object.values(ALL_CHAINS).find(
    (chain) =>
      chain.chainId.toString() === reference && chain.namespace === namespace
  );
}

export type WCChains = Record<string, WCChain>;

export type WCChain = {
  chainId: number;
  name: string;
  logo: string;
  rgb: string;
  rpc: string;
  namespace: string;
};

export enum EthEvent {
  AccountsChanged = "accountsChanged",
  ChainChanged = "chainChanged",
}

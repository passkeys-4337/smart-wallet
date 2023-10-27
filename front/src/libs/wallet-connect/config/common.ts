import { IWalletConnectConfig } from "../service/wallet-connect";
import { EIP155_CHAINS } from "./EIP155";

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

export const ALL_CHAINS: WCChains = {
  ...EIP155_CHAINS,
};

export const WC_CONFIG: IWalletConnectConfig = {
  projectId: "658777a4b5a4139c881ecbee9e123d86",
  metadata: {
    name: "Cacao",
    description: "Cacao Wallet",
    url: "https://hocuspocusxyz-k7vf.vercel.app/",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  },
};

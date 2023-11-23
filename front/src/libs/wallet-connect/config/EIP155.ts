/**
 * @desc Refference list of eip155 chains
 * @url https://chainlist.org
 */

import { Hex } from "viem";
import { WCChains } from "./common";

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS;

/**
 * Supported Chains
 */
export const EIP155_MAINNET_CHAINS: WCChains = {
  "eip155:1": {
    chainId: 1,
    name: "Ethereum",
    logo: "/chain-logos/eip155-1.png",
    rgb: "99, 125, 234",
    rpc: "https://cloudflare-eth.com/",
    namespace: "eip155",
  },
  "eip155:43114": {
    chainId: 43114,
    name: "Avalanche C-Chain",
    logo: "/chain-logos/eip155-43113.png",
    rgb: "232, 65, 66",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    namespace: "eip155",
  },
  "eip155:137": {
    chainId: 137,
    name: "Polygon",
    logo: "/chain-logos/eip155-137.png",
    rgb: "130, 71, 229",
    rpc: "https://polygon-rpc.com/",
    namespace: "eip155",
  },
  "eip155:10": {
    chainId: 10,
    name: "Optimism",
    logo: "/chain-logos/eip155-10.png",
    rgb: "235, 0, 25",
    rpc: "https://mainnet.optimism.io",
    namespace: "eip155",
  },
  "eip155:324": {
    chainId: 324,
    name: "zkSync Era",
    logo: "/chain-logos/eip155-324.svg",
    rgb: "242, 242, 242",
    rpc: "https://mainnet.era.zksync.io/",
    namespace: "eip155",
  },
};

export const EIP155_TEST_CHAINS = {
  "eip155:5": {
    chainId: 5,
    name: "Ethereum Goerli",
    logo: "/chain-logos/eip155-1.png",
    rgb: "99, 125, 234",
    rpc: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    namespace: "eip155",
  },
  "eip155:11155111": {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    logo: "/chain-logos/eip155-11155111.png",
    rgb: "99, 125, 234",
    rpc: "https://rpc.ankr.com/eth_sepolia",
    namespace: "eip155",
  },
  "eip155:43113": {
    chainId: 43113,
    name: "Avalanche Fuji",
    logo: "/chain-logos/eip155-43113.png",
    rgb: "232, 65, 66",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    namespace: "eip155",
  },
  "eip155:80001": {
    chainId: 80001,
    name: "Polygon Mumbai",
    logo: "/chain-logos/eip155-137.png",
    rgb: "130, 71, 229",
    rpc: "https://matic-mumbai.chainstacklabs.com",
    namespace: "eip155",
  },
  "eip155:420": {
    chainId: 420,
    name: "Optimism Goerli",
    logo: "/chain-logos/eip155-10.png",
    rgb: "235, 0, 25",
    rpc: "https://goerli.optimism.io",
    namespace: "eip155",
  },
  "eip155:280": {
    chainId: 280,
    name: "zkSync Era Testnet",
    logo: "/chain-logos/eip155-324.svg",
    rgb: "242, 242, 242",
    rpc: "https://testnet.era.zksync.dev/",
    namespace: "eip155",
  },
};

export const EIP155_CHAINS = {
  ...EIP155_MAINNET_CHAINS,
  ...EIP155_TEST_CHAINS,
};

/**
 * Methods
 */
export enum EIP155Method {
  PersonalSign = "personal_sign",
  EthSign = "eth_sign",
  EthSignTransaction = "eth_signTransaction",
  SignTypedData = "eth_signTypedData",
  SignTypedDataV3 = "eth_signTypedData_v3",
  SignTypedDataV4 = "eth_signTypedData_v4",
  EthSendRawTransaction = "eth_sendRawTransaction",
  EthSendTransaction = "eth_sendTransaction",
  // SwitchChain = "wallet_switchEthereumChain",
  // AddChain = "wallet_addEthereumChain",
}

export type EthSendTransactionParams = {
  from: Hex;
  to: Hex;
  data: Hex;
  value?: Hex;
  gas?: Hex;
  gasPrice?: Hex;
  nonce?: Hex;
};

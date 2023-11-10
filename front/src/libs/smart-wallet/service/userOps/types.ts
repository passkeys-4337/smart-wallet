import { Address, Hash, Hex } from "viem";
import { PartialBy } from "viem/types/utils";

export type Call = {
  dest: Address;
  value: bigint;
  data: Hex;
};

export type UserOperation = {
  sender: Hex;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
};

export type UserOperationAsHex = {
  sender: Hex;
  nonce: Hex;
  initCode: Hex;
  callData: Hex;
  callGasLimit: Hex;
  verificationGasLimit: Hex;
  preVerificationGas: Hex;
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
  paymasterAndData: Hex;
  signature: Hex;
};

export type ERC4337RpcSchema = [
  {
    Method: "eth_sendUserOperation";
    Parameters: [userOperation: UserOperationAsHex, entryPoint: Address];
    ReturnType: Hash;
  },
  {
    Method: "eth_estimateUserOperationGas";
    Parameters: [
      userOperation: PartialBy<
        UserOperationAsHex,
        "callGasLimit" | "preVerificationGas" | "verificationGasLimit"
      >,
      entryPoint: Address,
    ];
    ReturnType: {
      preVerificationGas: Hex;
      verificationGasLimit: Hex;
      callGasLimit: Hex;
    };
  },
  {
    Method: "eth_supportedEntryPoints";
    Parameters: [];
    ReturnType: Address[];
  },
  {
    Method: "eth_chainId";
    Parameters: [];
    ReturnType: Hex;
  },
  {
    Method: "eth_getUserOperationByHash";
    Parameters: [hash: Hash];
    ReturnType: {
      userOperation: UserOperationAsHex;
      entryPoint: Address;
      transactionHash: Hash;
      blockHash: Hash;
      blockNumber: Hex;
    };
  },
  {
    Method: "eth_getUserOperationReceipt";
    Parameters: [hash: Hash];
    ReturnType: UserOperationReceiptWithBigIntAsHex;
  },
];

type UserOperationReceiptWithBigIntAsHex = {
  userOpHash: Hash;
  sender: Address;
  nonce: Hex;
  actualGasUsed: Hex;
  actualGasCost: Hex;
  success: boolean;
  receipt: {
    transactionHash: Hex;
    transactionIndex: Hex;
    blockHash: Hash;
    blockNumber: Hex;
    from: Address;
    to: Address | null;
    cumulativeGasUsed: Hex;
    status: "0x0" | "0x1";
    gasUsed: Hex;
    contractAddress: Address | null;
    logsBloom: Hex;
    effectiveGasPrice: Hex;
  };
  logs: {
    data: Hex;
    blockNumber: Hex;
    blockHash: Hash;
    transactionHash: Hash;
    logIndex: Hex;
    transactionIndex: Hex;
    address: Address;
    topics: Hex[];
  }[];
};

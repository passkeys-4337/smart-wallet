import { UserOperation } from "@/libs/smart-wallet/service/userOps/types";
import { toHex, zeroAddress } from "viem";

export const DEFAULT_CALL_GAS_LIMIT = BigInt(200_000);
export const DEFAULT_VERIFICATION_GAS_LIMIT = BigInt(2_000_000); // 2M
export const DEFAULT_PRE_VERIFICATION_GAS = BigInt(80_000); //65000

export const DEFAULT_USER_OP: UserOperation = {
  sender: zeroAddress,
  nonce: BigInt(0),
  initCode: toHex(new Uint8Array(0)),
  callData: toHex(new Uint8Array(0)),
  callGasLimit: DEFAULT_CALL_GAS_LIMIT,
  verificationGasLimit: DEFAULT_VERIFICATION_GAS_LIMIT,
  preVerificationGas: DEFAULT_PRE_VERIFICATION_GAS,
  maxFeePerGas: BigInt(3_000_000_000),
  maxPriorityFeePerGas: BigInt(1_000_000_000),
  paymasterAndData: toHex(new Uint8Array(0)),
  signature: toHex(new Uint8Array(0)),
};

export const emptyHex = toHex(new Uint8Array(0));

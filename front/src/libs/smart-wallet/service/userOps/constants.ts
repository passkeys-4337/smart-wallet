import { UserOperation } from "@/libs/smart-wallet/service/userOps/types";
import { toHex } from "viem";

export const DEFAULT_CALL_GAS_LIMIT = BigInt(35000);
export const DEFAULT_VERIFICATION_GAS_LIMIT = BigInt(70000);
export const DEFAULT_PRE_VERIFICATION_GAS = BigInt(21000);

export const ZERO_ADDRESS = toHex(new Uint8Array(20)); // 0x00 * 20

export const DEFAULT_USER_OP: UserOperation = {
  sender: ZERO_ADDRESS,
  nonce: BigInt(0),
  initCode: toHex(new Uint8Array(0)),
  callData: toHex(new Uint8Array(0)),
  callGasLimit: DEFAULT_CALL_GAS_LIMIT,
  verificationGasLimit: DEFAULT_VERIFICATION_GAS_LIMIT,
  preVerificationGas: DEFAULT_PRE_VERIFICATION_GAS,
  maxFeePerGas: BigInt(0),
  maxPriorityFeePerGas: BigInt(0),
  paymasterAndData: ZERO_ADDRESS,
  signature: toHex(new Uint8Array(0)),
};

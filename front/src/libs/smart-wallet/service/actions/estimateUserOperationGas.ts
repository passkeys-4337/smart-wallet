import { ENTRYPOINT_ADDRESS } from "@/constants";
import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/libs/smart-wallet/service/userOps";

/*  */
export type EstimateUserOperationGasReturnType = {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
};

export async function estimateUserOperationGas(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex },
): Promise<EstimateUserOperationGasReturnType> {
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: [{ ...args.userOp }, ENTRYPOINT_ADDRESS],
  });
}

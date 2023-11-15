import { ENTRYPOINT_ADDRESS } from "@/constants";
import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/libs/smart-wallet/service/userOps";
import { Hash } from "viem";

/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex },
): Promise<SendUserOperationReturnType> {
  return await client.request({
    method: "eth_sendUserOperation" as any,
    params: [args.userOp, ENTRYPOINT_ADDRESS],
  });
}

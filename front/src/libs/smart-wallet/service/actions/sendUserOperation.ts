import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";
import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { Hash, Hex, Chain, EstimateFeesPerGasReturnType } from "viem";

/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: SmartWalletClient,
  args: { to: Hex; value: bigint },
): Promise<SendUserOperationReturnType> {
  const builder = new UserOpBuilder(client.chain as Chain);

  const gasPrice: EstimateFeesPerGasReturnType = await client.estimateFeesPerGas();

  const userOp = await builder.buildUserOp({
    to: args.to,
    value: args.value,
    maxFeePerGas: gasPrice.maxFeePerGas as bigint,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas as bigint,
  });

  return await client.request({
    method: "eth_sendUserOperation" as any,
    params: [builder.toParams(userOp), builder.entryPoint],
  });
}

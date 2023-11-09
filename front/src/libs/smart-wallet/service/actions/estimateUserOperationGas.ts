import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";

/*  */
export type EstimateUserOperationGasReturnType = bigint;

export async function estimateUserOperationGas(
  client: SmartWalletClient,
  args: any,
): Promise<EstimateUserOperationGasReturnType> {
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: args,
  });
}

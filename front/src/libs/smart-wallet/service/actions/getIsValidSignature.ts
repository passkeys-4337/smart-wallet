import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";

export type GetIsValidSignatureReturnType = boolean;

export async function getIsValidSignature(
  client: SmartWalletClient,
  args: any,
): Promise<GetIsValidSignatureReturnType> {
  return await client.request({
    method: "eth_call" as any,
    params: args,
  });
}

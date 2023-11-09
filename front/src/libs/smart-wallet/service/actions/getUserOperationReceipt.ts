import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";
import { Hash } from "viem";

export type GetUserOperationReceiptReturnType = Hash;

export async function getUserOperationReceipt(
  client: SmartWalletClient,
  args: { hash: Hash },
): Promise<any> {
  return await client.request({
    method: "eth_getUserOperationReceipt" as any,
    params: [args.hash],
  });
}

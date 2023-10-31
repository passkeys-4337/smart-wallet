import { Client, Hash } from "viem";

/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: Client,
  args: any
): Promise<SendUserOperationReturnType> {
  return await client.request({
    method: "eth_sendUserOperation" as any,
    params: args,
  });
}

/*  */
export type EstimateUserOperationGasReturnType = bigint;

export async function estimateUserOperationGas(
  client: Client,
  args: any
): Promise<EstimateUserOperationGasReturnType> {
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: args,
  });
}

/*  */
export type GetUserOperationReceiptReturnType = Hash;

export async function getUserOperationReceipt(
  client: Client,
  args: any
): Promise<any> {
  return await client.request({
    method: "eth_getUserOperationReceipt" as any,
    params: args,
  });
}

/*  */
export type GetIsValidSignatureReturnType = boolean;

export async function getIsValidSignature(
  client: Client,
  args: any
): Promise<GetIsValidSignatureReturnType> {
  return await client.request({
    method: "eth_call" as any,
    params: args,
  });
}

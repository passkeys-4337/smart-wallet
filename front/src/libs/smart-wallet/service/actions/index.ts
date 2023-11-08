import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { P256Credential, WebAuthn } from "@/libs/webauthn";
import {
  Chain,
  Client,
  Hash,
  Hex,
  RpcTransactionRequest,
  encodeAbiParameters,
  encodePacked,
} from "viem";

/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: Client,
  args: { to: Hex; value: bigint },
): Promise<SendUserOperationReturnType> {
  const builder = new UserOpBuilder(client.chain as Chain);

  const { userOp, msgToSign } = await builder.buildUserOp({
    to: args.to,
    value: args.value,
  });

  const credentials: P256Credential = (await new WebAuthn().get(msgToSign)) as P256Credential;

  const signatureUserOp = encodePacked(
    ["uint8", "uint48", "bytes"],
    [
      1,
      0,
      encodeAbiParameters(
        [
          {
            type: "tuple",
            name: "credentials",
            components: [
              {
                name: "authenticatorData",
                type: "bytes",
              },
              {
                name: "clientDataJSON",
                type: "string",
              },
              {
                name: "challengeLocation",
                type: "uint256",
              },
              {
                name: "responseTypeLocation",
                type: "uint256",
              },
              {
                name: "r",
                type: "bytes32",
              },
              {
                name: "s",
                type: "bytes32",
              },
            ],
          },
        ],
        [
          {
            authenticatorData: credentials.authenticatorData,
            clientDataJSON: JSON.stringify(credentials.clientData),
            challengeLocation: BigInt(23),
            responseTypeLocation: BigInt(1),
            r: credentials.signature.r,
            s: credentials.signature.s,
          },
        ],
      ),
    ],
  );

  const userOpAsParams = builder.toParams({ ...userOp, signature: signatureUserOp });

  return await client.request({
    method: "eth_sendUserOperation" as any,
    params: [userOpAsParams, builder.entryPoint],
  });
}

/*  */
export type EstimateUserOperationGasReturnType = bigint;

export async function estimateUserOperationGas(
  client: Client,
  args: any,
): Promise<EstimateUserOperationGasReturnType> {
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: args,
  });
}

/*  */
export type GetUserOperationReceiptReturnType = Hash;

export async function getUserOperationReceipt(client: Client, args: any): Promise<any> {
  return await client.request({
    method: "eth_getUserOperationReceipt" as any,
    params: args,
  });
}

/*  */
export type GetIsValidSignatureReturnType = boolean;

export async function getIsValidSignature(
  client: Client,
  args: any,
): Promise<GetIsValidSignatureReturnType> {
  return await client.request({
    method: "eth_call" as any,
    params: args,
  });
}

import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { P256Credential, WebAuthn } from "@/libs/webauthn";
import {
  Chain,
  Client,
  Hash,
  RpcTransactionRequest,
  encodeAbiParameters,
  encodePacked,
} from "viem";

/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: Client,
  args: any,
): Promise<SendUserOperationReturnType> {
  const builder = new UserOpBuilder(client.chain as Chain);

  console.log("builder", builder);
  const { userOp, msgToSign } = await builder.buildUserOp({
    to: "0x061060a65146b3265C62fC8f3AE977c9B27260fF",
    value: BigInt(0),
  });

  console.log("msgToSign", msgToSign);

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
                type: "bytes",
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
            clientDataJSON: encodePacked(["string"], [JSON.stringify(credentials.clientData)]),
            challengeLocation: BigInt(23),
            responseTypeLocation: BigInt(1),
            r: credentials.signature.r,
            s: credentials.signature.s,
          },
        ],
      ),
    ],
  );

  console.log("signatureUserOp", signatureUserOp);

  const userOpAsParams = builder.toParams({ ...userOp, signature: signatureUserOp });
  console.log("userOpAsParams", userOpAsParams);

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

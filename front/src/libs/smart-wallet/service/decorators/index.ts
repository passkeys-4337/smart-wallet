import { Client, PublicActions, publicActions } from "viem";
import {
  EstimateUserOperationGasReturnType,
  estimateUserOperationGas,
  SendUserOperationReturnType,
  sendUserOperation,
  GetUserOperationReceiptReturnType,
  getUserOperationReceipt,
  GetIsValidSignatureReturnType,
  getIsValidSignature,
  waitForUserOperationReceipt,
} from "../actions";
import { SmartWalletClient } from "@/libs/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/libs/smart-wallet/service/userOps";

export type SmartWalletActions = {
  sendUserOperation: (args: { userOp: UserOperationAsHex }) => Promise<SendUserOperationReturnType>;
  estimateUserOperationGas: (args: {
    userOp: UserOperationAsHex;
  }) => Promise<EstimateUserOperationGasReturnType>;
  getUserOperationReceipt: (args: any) => Promise<GetUserOperationReceiptReturnType>;
  getIsValidSignature: (args: any) => Promise<GetIsValidSignatureReturnType>;
  waitForUserOperationReceipt: (args: any) => Promise<GetUserOperationReceiptReturnType>;
};

export function smartWalletActions(client: Client): SmartWalletActions {
  return {
    ...publicActions(client),
    sendUserOperation: (args) => sendUserOperation(client as SmartWalletClient, args),
    estimateUserOperationGas: (args) => estimateUserOperationGas(client as SmartWalletClient, args),
    getUserOperationReceipt: (args) => getUserOperationReceipt(client as SmartWalletClient, args),
    getIsValidSignature: (args) => getIsValidSignature(client as SmartWalletClient, args),
    waitForUserOperationReceipt: (args) =>
      waitForUserOperationReceipt(client as SmartWalletClient, args),
  };
}

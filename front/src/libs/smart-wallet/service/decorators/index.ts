import { Client } from "viem";
import {
  EstimateUserOperationGasReturnType,
  estimateUserOperationGas,
  SendUserOperationReturnType,
  sendUserOperation,
  GetUserOperationReceiptReturnType,
  getUserOperationReceipt,
  GetIsValidSignatureReturnType,
  getIsValidSignature,
} from "../actions";

export type SmartWalletActions = {
  sendUserOperation: (args: any) => Promise<SendUserOperationReturnType>;
  estimateUserOperationGas: (
    args: any
  ) => Promise<EstimateUserOperationGasReturnType>;
  getUserOperationReceipt: (
    args: any
  ) => Promise<GetUserOperationReceiptReturnType>;
  getIsValidSignature: (args: any) => Promise<GetIsValidSignatureReturnType>;
};

export function smartWalletActions(client: Client): SmartWalletActions {
  return {
    sendUserOperation: (args) => sendUserOperation(client, args),
    estimateUserOperationGas: (args) => estimateUserOperationGas(client, args),
    getUserOperationReceipt: (args) => getUserOperationReceipt(client, args),
    getIsValidSignature: (args) => getIsValidSignature(client, args),
  };
}

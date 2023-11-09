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

export type SmartWalletActions = {
  sendUserOperation: (args: any) => Promise<SendUserOperationReturnType>;
  estimateUserOperationGas: (args: any) => Promise<EstimateUserOperationGasReturnType>;
  getUserOperationReceipt: (args: any) => Promise<GetUserOperationReceiptReturnType>;
  getIsValidSignature: (args: any) => Promise<GetIsValidSignatureReturnType>;
  waitForUserOperationReceipt: (args: any) => Promise<GetUserOperationReceiptReturnType>;
};

export function smartWalletActions(client: SmartWalletClient): SmartWalletActions {
  return {
    sendUserOperation: (args) => sendUserOperation(client, args),
    estimateUserOperationGas: (args) => estimateUserOperationGas(client, args),
    getUserOperationReceipt: (args) => getUserOperationReceipt(client, args),
    getIsValidSignature: (args) => getIsValidSignature(client, args),
    waitForUserOperationReceipt: (args) => waitForUserOperationReceipt(client, args),
  };
}

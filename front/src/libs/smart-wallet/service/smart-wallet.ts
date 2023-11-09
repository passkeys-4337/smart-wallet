import { Client, Chain, Transport, createPublicClient, Hash } from "viem";
import { baseGoerli } from "viem/chains";
import { SmartWalletActions, smartWalletActions } from "./decorators";
import { transport } from "../config";
import { PublicClient } from "wagmi";

export type SmartWalletClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
> = Client<transport, chain, undefined, any, SmartWalletActions> & PublicClient;

class SmartWallet {
  private _client: SmartWalletClient;
  private static _instance: SmartWallet;
  private _isInitiated: boolean = false;

  constructor() {
    this._client = createPublicClient({
      chain: baseGoerli,
      transport,
    }).extend(smartWalletActions);
  }

  public init() {
    this._isInitiated = true;
  }

  public get client() {
    console.warn(
      "smartWallet: isInit() is not called. Only use this getter if you want to access wagmi publicClient method.",
    );
    return this._client;
  }

  public async sendUserOperation(args: any): Promise<`0x${string}`> {
    this._isInit();
    return await this._client.sendUserOperation({
      ...args,
    });
  }

  public async estimateUserOperationGas(args: any): Promise<bigint> {
    this._isInit();
    return await this._client.estimateUserOperationGas({
      ...args,
    });
  }

  public async getUserOperationReceipt(args: { hash: Hash }): Promise<`0x${string}`> {
    this._isInit();
    return await this._client.getUserOperationReceipt({
      ...args,
    });
  }

  public async getIsValidSignature(args: any): Promise<boolean> {
    this._isInit();
    return await this._client.getIsValidSignature({
      ...args,
    });
  }

  public async waitForUserOperationReceipt(args: any): Promise<any> {
    this._isInit();
    console.log("her");
    return await this._client.waitForUserOperationReceipt({
      ...args,
    });
  }

  private _isInit() {
    if (this._isInitiated) {
      return true;
    } else {
      throw new Error("SmartWallet is not initialized");
    }
  }
}

export const smartWallet = new SmartWallet();

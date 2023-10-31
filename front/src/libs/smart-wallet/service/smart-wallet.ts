import {
  createClient,
  Client,
  fallback,
  Chain,
  Transport,
  createPublicClient,
} from "viem";
import { mainnet } from "viem/chains";
import { SmartWalletActions, smartWalletActions } from "./decorators";
import { Prettify } from "viem/_types/types/utils";
import { transport } from "../config";
import { PublicClient } from "wagmi";

type SmartWalletClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined
> = Client<transport, chain, undefined, any, SmartWalletActions> & PublicClient;

class SmartWallet {
  private _address: string = "";
  private _client: SmartWalletClient;
  private static _instance: SmartWallet;

  constructor() {
    this._client = createPublicClient({
      chain: mainnet,
      transport,
    }).extend(smartWalletActions);
  }

  public static getInstance(): SmartWallet {
    if (!this._instance) {
      this._instance = new this();
    }
    return this._instance;
  }

  public init(address: string) {
    this._address = address;
  }

  public get address() {
    this._isInit();
    return this._address;
  }

  public get client() {
    console.warn(
      "smartWallet: isInit() is not called. Only use this getter if you want to access wagmi publicClient method."
    );
    return this._client;
  }

  public async sendUserOperation(args: any) {
    this._isInit();
    return await this._client.sendUserOperation({
      from: this._address,
      ...args,
    });
  }

  public async estimateUserOperationGas(args: any) {
    this._isInit();
    return await this._client.estimateUserOperationGas({
      from: this._address,
      ...args,
    });
  }

  public async getUserOperationReceipt(args: any) {
    this._isInit();
    return await this._client.getUserOperationReceipt({
      from: this._address,
      ...args,
    });
  }

  public async getIsValidSignature(args: any) {
    this._isInit();
    return await this._client.getIsValidSignature({
      from: this._address,
      ...args,
    });
  }

  private _isInit() {
    if (this._address) {
      return true;
    } else {
      throw new Error("SmartWallet is not initialized");
    }
  }
}

export const smartWallet = SmartWallet.getInstance();

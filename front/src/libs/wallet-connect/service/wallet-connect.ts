import { Core } from "@walletconnect/core";
import { EventEmitter } from "events";
import { Web3Wallet, Web3WalletTypes, IWeb3Wallet } from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { SessionTypes } from "@walletconnect/types";
import {
  EIP155_CHAINS,
  EIP155Method,
  EthSendTransactionParams,
} from "@/libs/wallet-connect/config/EIP155";
import { EthEvent, WCChains } from "@/libs/wallet-connect/config/common";
import { Hash } from "viem";

export interface IWalletConnectConfig {
  projectId: string;
  relayUrl?: string;
  metadata: Web3WalletTypes.Metadata;
}

export enum WCEvent {
  sessionChanged = "session_changed",
  pairingApproved = "pairing_approved",
  pairingRejected = "pairing_rejected",
  EthSendTransaction = EIP155Method.EthSendTransaction,
  MethodNotSupported = "method_not_supported",
}

export interface IPairingApprovedEventPayload {
  pairingTopic: string;
}

export interface IPairingRejectedEventPayload {
  pairingTopic: string;
  msg: string;
}

export type EthSendEventPayload = {
  params: EthSendTransactionParams;
  origin: string;
  onSuccess: (hash: Hash) => void;
  onReject: () => Promise<void>;
};

/**
 *  WalletConnect
 * @description
 * WalletConnect is a singleton class that manages the connection to the WalletConnect service.
 * It is responsible for initializing the connection, handling events, and managing sessions.
 *
 * */
class WalletConnect extends EventEmitter {
  public sessions: Record<string, SessionTypes.Struct> = {};
  private _smartWalletAddress: string = "";
  private _web3wallet: IWeb3Wallet | null;

  constructor() {
    super();
    this.sessions = {};
    this._web3wallet = null;
  }
  public set smartWalletAddress(address: string) {
    this._smartWalletAddress = address;
  }

  public async init({
    walletConnectConfig,
    smartWalletAddress,
  }: {
    walletConnectConfig: IWalletConnectConfig;
    smartWalletAddress: string;
  }): Promise<void> {
    this._smartWalletAddress = smartWalletAddress;

    const core = new Core({
      projectId: walletConnectConfig.projectId,
      // TODO: optimize relayerRegionURL base on user's location
      // relayUrl: relayerRegionURL ?? process.env.NEXT_PUBLIC_RELAY_URL,
    });

    this._web3wallet = await Web3Wallet.init({
      core,
      metadata: walletConnectConfig.metadata,
    });

    if (!this._web3wallet) throw new Error("Web3Wallet is not initialized");
    this._web3wallet.on("session_proposal", (event) => this._onSessionProposal(event));
    this._web3wallet.on("session_request", (event) => this._onSessionRequest(event));
    this._web3wallet.on("session_delete", () => this._onSessionDelete());
    this._setSessions();
  }

  public unsubscribe(): void {
    if (!this._web3wallet) return;
    this._web3wallet.off("session_proposal", (event) => this._onSessionProposal(event));
    this._web3wallet.off("session_request", (event) => this._onSessionRequest(event));
    this._web3wallet.off("session_delete", () => this._onSessionDelete());
  }

  public async pair(uri: string): Promise<void> {
    if (!this._web3wallet) return;
    await this._web3wallet.pair({ uri });
    this._setSessions();
  }

  public async disconnectSession(topic: string): Promise<void> {
    if (!this._web3wallet) return;
    await this._web3wallet.disconnectSession({
      topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
    this._setSessions();
  }

  public async extendSession(topic: string): Promise<void> {
    if (!this._web3wallet) return;
    await this._web3wallet.extendSession({
      topic,
    });
    this._setSessions();
  }

  public async updateSession({
    topic,
    namespaces,
  }: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }): Promise<void> {
    if (!this._web3wallet) return;
    await this._web3wallet.updateSession({
      topic,
      namespaces,
    });
    this._setSessions();
  }

  public async emitSessionEvent(params: {
    topic: string;
    event: any;
    chainId: string;
  }): Promise<void> {
    if (!this._web3wallet) return;
    await this._web3wallet.emitSessionEvent(params);
    this._setSessions();
  }

  private async _onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    if (!this._web3wallet) return;

    try {
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: Object.keys(EIP155_CHAINS),
            methods: Object.values(EIP155Method),
            events: [EthEvent.AccountsChanged, EthEvent.ChainChanged],
            accounts: this._getAccounts(EIP155_CHAINS),
          },
        },
      });
      await this._web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      });
      this.emit(WCEvent.pairingApproved, {
        pairingTopic: params.pairingTopic,
      });
      this._setSessions();
      // switch to Sepolia
    } catch (error) {
      await this._web3wallet.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED"),
      });
      this.emit(WCEvent.pairingRejected, {
        pairingTopic: params.pairingTopic,
        msg: "Session rejected: the wallet does not support the requested chain and/or rpc methods",
      });
    }
  }

  private async _onSessionRequest(event: Web3WalletTypes.SessionRequest): Promise<void> {
    if (!this._web3wallet) return;
    const { topic, params, id, verifyContext } = event;
    const { request } = params;

    this._jsonRpcEventRouter({
      method: request.method,
      params: request.params,
      origin: verifyContext.verified.origin?.split("https://")[1] ?? "",
      onSuccess: async (hash) => {
        const response = { id, result: hash, jsonrpc: "2.0" };
        await this._web3wallet?.respondSessionRequest({
          topic,
          response,
        });
        return;
      },
      onReject: async () => {
        const response = {
          id,
          jsonrpc: "2.0",
          error: {
            code: 5000,
            message: "User rejected.",
          },
        };
        await this._web3wallet?.respondSessionRequest({
          topic,
          response,
        });
        return;
      },
    });
  }

  private async _onSessionDelete(): Promise<void> {
    this._setSessions();
  }

  private _setSessions(): void {
    if (!this._web3wallet) return;
    this.sessions = this._web3wallet.getActiveSessions();
    this.emit(WCEvent.sessionChanged, this.sessions);
  }

  private _getAccounts(chains: WCChains): string[] {
    const accounts = Object.keys(chains).map((prefix) => {
      return `${prefix}:${this._smartWalletAddress}`;
    });

    return accounts;
  }

  private _jsonRpcEventRouter({
    method,
    params,
    origin,
    onSuccess,
    onReject,
  }: {
    method: string;
    params: any[];
    origin: string;
    onSuccess: (hash: Hash) => void;
    onReject: () => Promise<void>;
  }) {
    switch (method) {
      case EIP155Method.EthSendTransaction:
        this.emit(WCEvent.EthSendTransaction, {
          params: params[0] as EthSendTransactionParams,
          origin,
          onSuccess,
          onReject,
        } as EthSendEventPayload);
        return null;

      default:
        this.emit(WCEvent.MethodNotSupported, method);
        return null;
    }
  }
}

export const walletConnect = new WalletConnect();

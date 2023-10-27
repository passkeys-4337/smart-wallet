import { Core } from "@walletconnect/core";
import { EventEmitter } from "events";
import {
  Web3Wallet,
  Web3WalletTypes,
  IWeb3Wallet,
} from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { SessionTypes } from "@walletconnect/types";
import {
  EIP155_CHAINS,
  EIP155Method,
} from "@/libs/wallet-connect/config/EIP155";
import { EthEvent, WCChains } from "@/libs/wallet-connect/config/common";

export interface IWalletConnectConfig {
  projectId: string;
  relayUrl?: string;
  metadata: Web3WalletTypes.Metadata;
}

/**
 *  WalletConnect
 * @description
 * WalletConnect is a singleton class that manages the connection to the WalletConnect service.
 * It is responsible for initializing the connection, handling events, and managing sessions.
 *
 * */
class WalletConnect extends EventEmitter {
  public sessions: Record<string, SessionTypes.Struct> = {};
  private _smartWalletAddress: string | null =
    "0x938f169352008d35e065F153be53b3D3C07Bcd90";
  private _web3wallet: IWeb3Wallet | null = null;

  constructor() {
    super();
  }

  public async init(walletConnectConfig: IWalletConnectConfig) {
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

    this._web3wallet.on("session_proposal", this._onSessionProposal);
    this._web3wallet.on("session_request", this._onSessionRequest);
    this._web3wallet.on("session_delete", this._onSessionDelete);
    // this._web3wallet.on("auth_request", this._onAuthRequest);

    console.log("WalletConnect: initialized");
    const clientId =
      await this._web3wallet.engine.signClient.core.crypto.getClientId();
    console.log("WalletConnect ClientID: ", clientId);
    this._setSessions();
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

  private async _onSessionProposal({
    id,
    params,
  }: Web3WalletTypes.SessionProposal) {
    if (!this._web3wallet) return;

    try {
      // ------- namespaces builder util ------------ //
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: Object.keys(EIP155_CHAINS),
            methods: Object.keys(EIP155Method),
            events: [EthEvent.AccountsChanged, EthEvent.ChainChanged],
            accounts: this._getAccounts(EIP155_CHAINS),
          },
        },
      });
      // ------- end namespaces builder util ------------ //
      console.log("approving namespaces:", approvedNamespaces);

      await this._web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      });
      this._setSessions();
    } catch (error) {
      await this._web3wallet.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED"),
      });
    }
  }

  private async _onSessionRequest(
    event: Web3WalletTypes.SessionRequest
  ): Promise<void> {
    if (!this._web3wallet) return;
    const { topic, params, id } = event;
    const { request } = params;
    const requestParamsMessage = request.params[0];

    // convert `requestParamsMessage` by using a method like hexToUtf8
    // const message = hexToUtf8(requestParamsMessage);
    const response = { id, result: "", jsonrpc: "2.0" };
    await this._web3wallet.respondSessionRequest({
      topic,
      response,
    });
  }

  private async _onSessionDelete(
    event: Web3WalletTypes.SessionDelete
  ): Promise<void> {
    this._setSessions();
  }

  // MOBILE ONLY
  // private async _onAuthRequest(
  //   event: Web3WalletTypes.AuthRequest
  // ): Promise<void> {}

  private _setSessions(): void {
    if (!this._web3wallet) return;
    const sessions = this._web3wallet.getActiveSessions();

    this.sessions = sessions;

    console.log(
      "WalletConnect: sessions",
      this._web3wallet.getActiveSessions()
    );
    console.log(
      "WalletConnect: pairings",
      this._web3wallet.core.pairing.getPairings()
    );
    // Emit an event to notify that sessions have changed
    console.log("WalletConnect: sessions changed event emitted");
    this.emit("sessionsChanged", this.sessions);
  }

  private _getAccounts(chains: WCChains): string[] {
    const accounts = Object.keys(chains).map((prefix) => {
      return `${prefix}:${this._smartWalletAddress}`;
    });

    return accounts;
  }

  // FROM WALLET CONNECT EXAMPLE IF NEEDED

  // async updateSignClientChainId(chainId: string, address: string) {
  //   console.log("chainId", chainId, address);
  //   if (!this._web3wallet) return;

  //   // get most recent session
  //   const sessions = this._web3wallet.getActiveSessions();
  //   if (!sessions) return;
  //   const namespace = chainId.split(":")[0];
  //   Object.values(sessions).forEach(async (session) => {
  //     await this._web3wallet.updateSession({
  //       topic: session.topic,
  //       namespaces: {
  //         ...session.namespaces,
  //         [namespace]: {
  //           ...session.namespaces[namespace],
  //           chains: [
  //             ...new Set(
  //               [chainId].concat(
  //                 Array.from(session.namespaces[namespace].chains || [])
  //               )
  //             ),
  //           ],
  //           accounts: [
  //             ...new Set(
  //               [`${chainId}:${address}`].concat(
  //                 Array.from(session.namespaces[namespace].accounts)
  //               )
  //             ),
  //           ],
  //         },
  //       },
  //     });
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     const chainChanged = {
  //       topic: session.topic,
  //       event: {
  //         name: "chainChanged",
  //         data: parseInt(chainId.split(":")[1]),
  //       },
  //       chainId: chainId,
  //     };

  //     const accountsChanged = {
  //       topic: session.topic,
  //       event: {
  //         name: "accountsChanged",
  //         data: [`${chainId}:${address}`],
  //       },
  //       chainId,
  //     };
  //     await this._web3wallet.emitSessionEvent(chainChanged);
  //     await this._web3wallet.emitSessionEvent(accountsChanged);
  //   });
  // }
}

export const walletConnect = new WalletConnect();

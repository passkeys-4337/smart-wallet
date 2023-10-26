import { Core } from "@walletconnect/core";
import {
  Web3Wallet,
  Web3WalletTypes,
  IWeb3Wallet,
} from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

class WalletConnect {
  private _web3wallet: IWeb3Wallet | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    const core = new Core({
      projectId: process.env.PROJECT_ID,
    });

    this._web3wallet = await Web3Wallet.init({
      core, // <- pass the shared `core` instance
      metadata: {
        name: "Demo app",
        description: "Demo Client as Wallet/Peer",
        url: "www.walletconnect.com",
        icons: [],
      },
    });

    this._web3wallet.on("session_proposal", this._onSessionProposal);
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
            chains: ["eip155:1", "eip155:137"],
            methods: ["eth_sendTransaction", "personal_sign"],
            events: ["accountsChanged", "chainChanged"],
            accounts: [
              "eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb",
              "eip155:137:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb",
            ],
          },
        },
      });
      // ------- end namespaces builder util ------------ //

      const session = await this._web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      });
    } catch (error) {
      await this._web3wallet.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED"),
      });
    }
  }
}

export const walletConnect = new WalletConnect();

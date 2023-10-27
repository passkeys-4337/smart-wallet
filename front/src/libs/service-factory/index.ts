import { walletConnect } from "@/libs/wallet-connect/wallet-connect";

class ServiceFactory {
  constructor() {}

  public init() {
    console.log("ServiceFactory init");

    walletConnect.init({
      projectId: "c0a0c0a0-0a0a-0a0a-0a0a-0a0a0a0a0a0a",
      metadata: {
        name: "Cacao",
        description: "Cacao Wallet",
        url: "",
        icons: [""],
      },
    });
  }
}
export const serviceFactory = new ServiceFactory();

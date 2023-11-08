import { useEffect, useState } from "react";
import { smartWallet } from "../service/smart-wallet";
import { Hash } from "viem";

export function useSmartWalletHook() {
  const [address, setAddress] = useState<Hash | null>(null);

  async function init(address: Hash) {
    smartWallet.init(address);
    setAddress(address);
  }

  useEffect(() => {
    if (!address) return;

    smartWallet.client.watchEvent({
      address: address,
      onLogs: (logs: any) => {
        console.log("logs", logs);
      },
    });
  }, [address]);

  return {
    address,
    init,
  };
}

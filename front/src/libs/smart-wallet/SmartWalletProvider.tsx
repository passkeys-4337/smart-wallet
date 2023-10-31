"use client";

import React, { useContext } from "react";
import { useSmartWalletHook } from "@/libs/smart-wallet/hook/useSmartWalletHook";
import { WagmiConfig, createConfig } from "wagmi";
import { smartWallet } from "./service/smart-wallet";

type UseSmartWallet = ReturnType<typeof useSmartWalletHook>;

const SmartWalletContext = React.createContext<UseSmartWallet | null>(null);
export const useWalletConnect = (): UseSmartWallet => {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error(
      "useSmartWalletHook must be used within a WalletConnectProvider"
    );
  }
  return context;
};

export function SmartWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const smartWalletValue = useSmartWalletHook();
  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient: smartWallet.client,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <SmartWalletContext.Provider value={smartWalletValue}>
        {children}
      </SmartWalletContext.Provider>
    </WagmiConfig>
  );
}

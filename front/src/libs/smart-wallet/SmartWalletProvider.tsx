"use client";

import React, { useContext } from "react";
import { useSmartWalletHook } from "@/libs/smart-wallet/hook/useSmartWalletHook";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { CHAIN } from "@/constants";

type UseSmartWallet = ReturnType<typeof useSmartWalletHook>;

const SmartWalletContext = React.createContext<UseSmartWallet | null>(null);
export const useWalletConnect = (): UseSmartWallet => {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error("useSmartWalletHook must be used within a SmartWalletProvider");
  }
  return context;
};

export function SmartWalletProvider({ children }: { children: React.ReactNode }) {
  const smartWalletValue = useSmartWalletHook();

  const { publicClient } = configureChains([CHAIN], [publicProvider()]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient: publicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <SmartWalletContext.Provider value={smartWalletValue}>{children}</SmartWalletContext.Provider>
    </WagmiConfig>
  );
}

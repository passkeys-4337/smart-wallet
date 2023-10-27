"use client";

import React, { useContext } from "react";
import { useWalletConnectHook } from "./hook/useWalletConnectHook";

type UseWalletConnect = ReturnType<typeof useWalletConnectHook>;

const WalletConnectContext = React.createContext<UseWalletConnect | null>(null);

export const useWalletConnect = (): UseWalletConnect => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error(
      "useWalletConnectHook must be used within a WalletConnectProvider"
    );
  }
  return context;
};

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const walletConnectValue = useWalletConnectHook();

  return (
    <WalletConnectContext.Provider value={walletConnectValue}>
      {children}
    </WalletConnectContext.Provider>
  );
}

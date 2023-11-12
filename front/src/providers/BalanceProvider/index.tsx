"use client";

import { getUser } from "@/libs/factory/getUser";
import { createContext, useContext, useState } from "react";
import { Hex } from "viem";

function useBalanceHook() {
  // balance in usd
  const [balance, setBalance] = useState<number>(0);

  async function getBalance(keyId: Hex) {
    const user = await getUser(keyId);
    const ethBalance = Number(user.balance) / 1e18;
    const priceData = await fetch("/api/price?ids=ethereum&currencies=usd");
    const price: number = (await priceData.json()).ethereum.usd;
    setBalance(ethBalance * price);
  }

  return {
    balance,
    getBalance,
  };
}

type UseBalanceHook = ReturnType<typeof useBalanceHook>;
const BalanceContext = createContext<UseBalanceHook | null>(null);

export const useBalance = (): UseBalanceHook => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalanceHook must be used within a BalanceProvider");
  }
  return context;
};

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const hook = useBalanceHook();

  return <BalanceContext.Provider value={hook}>{children}</BalanceContext.Provider>;
}

"use client";

import { getBalance } from "@/libs/factory/getBalance";
import { useMe } from "@/providers/MeProvider";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Hex, formatEther } from "viem";

function useBalanceHook() {
  // balance in usd
  const [balance, setBalance] = useState<string>("--.--");
  const [increment, setIncrement] = useState<number>(0);

  const { me } = useMe();

  const getBalanceUSD = useCallback(async (address: Hex) => {
    const res = await getBalance(address);
    const priceData = await fetch("/api/price?ids=ethereum&currencies=usd");
    const price: number = Math.trunc((await priceData.json()).ethereum.usd * 100);
    const balance = formatEther((BigInt(res.balance) * BigInt(price)) / BigInt(100));
    setBalance(balance);
  }, []);

  const refreshBalance = useCallback(() => {
    setIncrement((prev) => prev + 1);
  }, []);

  let interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!me?.account) return;
    getBalanceUSD(me?.account);
    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      getBalanceUSD(me?.account);
    }, 5000);

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, [me?.account, getBalanceUSD, increment]);

  return {
    balance,
    getBalance,
    refreshBalance,
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

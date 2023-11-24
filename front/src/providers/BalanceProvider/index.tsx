"use client";

import { getUser } from "@/libs/factory/getUser";
import { useMe } from "@/providers/MeProvider";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Hex, formatEther, zeroAddress } from "viem";

function useBalanceHook() {
  // balance in usd
  const [balance, setBalance] = useState<string>("0.00");
  const [increment, setIncrement] = useState<number>(0);

  const { me } = useMe();

  const getBalance = useCallback(async (keyId: Hex) => {
    const user = await getUser(keyId);
    if (user?.account === zeroAddress || user?.account === undefined) {
      setBalance("0.00");
      return;
    }

    console.log(user.balance);
    const priceData = await fetch("/api/price?ids=ethereum&currencies=usd");
    const price: number = Math.trunc((await priceData.json()).ethereum.usd * 100);
    const balance = formatEther((BigInt(user.balance) * BigInt(price)) / BigInt(100));
    setBalance(balance);
  }, []);

  const refreshBalance = useCallback(() => {
    setIncrement((prev) => prev + 1);
  }, []);

  let interval = useRef<any>(null);

  useEffect(() => {
    if (!me?.keyId) return;
    getBalance(me?.keyId);
    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      getBalance(me?.keyId);
    }, 3000);

    return () => {
      clearInterval(interval.current);
    };
  }, [me, getBalance, increment]);

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

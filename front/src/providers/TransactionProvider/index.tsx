"use client";

import { useMe } from "@/providers/MeProvider";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { GetLogsReturnType, Hex, Log } from "viem";

const useTxHook = () => {
  const [txs, setTxs] = useState<Array<Log> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { me } = useMe();

  const getLastTxs = useCallback(async (keyId: Hex) => {
    setLoading(true);
    const res = await fetch(`/api/users/${keyId}/txs`);
    const resJson = await res.json();
    setTxs(resJson.logs);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!me?.keyId) return;
    getLastTxs(me.keyId);
  }, [me?.keyId, getLastTxs]);

  useEffect(() => {}, [txs]);

  return {
    loading,
    txs,
    getLastTxs,
  };
};

type UseTxHook = ReturnType<typeof useTxHook>;
const TransactionContext = createContext<UseTxHook | null>(null);

export const useTransaction = (): UseTxHook => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTxHook must be used within a TransactionProvider");
  }
  return context;
};

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const hook = useTxHook();

  return <TransactionContext.Provider value={hook}>{children}</TransactionContext.Provider>;
}

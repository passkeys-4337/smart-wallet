"use client";

import { PUBLIC_CLIENT, ENTRYPOINT_ADDRESS } from "@/constants";
import { Me, useMe } from "@/providers/MeProvider";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Hex, Log } from "viem";

const useTxHook = () => {
  const [txs, setTxs] = useState<Array<Log> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { me } = useMe();

  const getLastTxs = useCallback(async (keyId: Hex) => {
    setLoading(true);
    const res = await fetch(`/api/users/${keyId}/txs`);
    const resJson = await res.json();
    setTxs((prev) => {
      const logs = resJson.logs.sort((a: Log, b: Log) => {
        return Number(b.blockNumber) - Number(a.blockNumber);
      });
      if (!prev) return logs;
      return [...prev, ...logs];
    });
    setLoading(false);
  }, []);

  const unwatchLogs = PUBLIC_CLIENT.watchContractEvent({
    address: ENTRYPOINT_ADDRESS,
    abi: [
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "userOpHash",
            type: "bytes32",
            indexed: true,
          },
          {
            internalType: "address",
            name: "sender",
            type: "address",
            indexed: true,
          },
          {
            internalType: "address",
            name: "paymaster",
            type: "address",
            indexed: true,
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
            indexed: false,
          },
          {
            internalType: "bool",
            name: "success",
            type: "bool",
            indexed: false,
          },
          {
            internalType: "uint256",
            name: "actualGasCost",
            type: "uint256",
            indexed: false,
          },
          {
            internalType: "uint256",
            name: "actualGasUsed",
            type: "uint256",
            indexed: false,
          },
        ],
        type: "event",
        name: "UserOperationEvent",
        anonymous: false,
      },
    ],
    eventName: "UserOperationEvent",
    args: { sender: me?.account },
    onLogs: (logs) => {
      setLoading(true);
      setTxs((prev) => {
        if (!prev) return logs;
        return [
          ...prev,
          ...logs.sort((a: Log, b: Log) => {
            return Number(b.blockNumber) - Number(a.blockNumber);
          }),
        ];
      });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!me) return;
    getLastTxs(me?.keyId);
  }, [me, getLastTxs]);

  return {
    loading,
    txs,
    getLastTxs,
    unwatchLogs,
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

"use client";

import React, { useEffect } from "react";
import { useModal } from "@/providers/ModalProvider";
import { EthSendTransactionParams } from "./config/EIP155";
import WCSendTransactionModal from "@/components/WCSendTransactionModal";
import { WCEvent, walletConnect } from "./service/wallet-connect";

export function ModalOnWCEvent({ children }: { children: React.ReactNode }) {
  const { open } = useModal();

  useEffect(() => {
    function handleEthSendTransaction(params: EthSendTransactionParams) {
      open(<WCSendTransactionModal params={params} />);
    }
    walletConnect.on(WCEvent.EthSendTransaction, handleEthSendTransaction);
    return () => {
      walletConnect.removeListener(WCEvent.EthSendTransaction, handleEthSendTransaction);
    };
  }, [open]);

  return <>{children}</>;
}

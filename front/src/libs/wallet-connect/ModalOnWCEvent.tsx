"use client";

import React, { useEffect } from "react";
import { useModal } from "@/providers/ModalProvider";
import { EthSendTransactionParams } from "./config/EIP155";
import WCSendTransactionModal from "@/components/WCSendTransactionModal";
import { WCEvent, walletConnect } from "./service/wallet-connect";
import WCNotSupportedModal from "@/components/WCNotSupportedModal";

export function ModalOnWCEvent({ children }: { children: React.ReactNode }) {
  const { open } = useModal();

  useEffect(() => {
    function handleEthSendTransaction(params: EthSendTransactionParams) {
      open(<WCSendTransactionModal params={params} />);
    }
    function handleMethodNotSupported(method: string) {
      open(<WCNotSupportedModal method={method} />);
    }

    walletConnect.on(WCEvent.MethodNotSupported, handleMethodNotSupported);
    walletConnect.on(WCEvent.EthSendTransaction, handleEthSendTransaction);
    return () => {
      walletConnect.removeListener(WCEvent.MethodNotSupported, handleMethodNotSupported);
      walletConnect.removeListener(WCEvent.EthSendTransaction, handleEthSendTransaction);
    };
  }, [open]);

  return <>{children}</>;
}

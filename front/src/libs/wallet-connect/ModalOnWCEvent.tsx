"use client";

import React, { useEffect } from "react";
import { useModal } from "@/providers/ModalProvider";
import { EthSendEventPayload, WCEvent, walletConnect } from "./service/wallet-connect";
import WCNotSupportedModal from "@/components/WCNotSupportedModal";
import WCSendTransactionModal from "@/components/WCSendTransactionModal";

export function ModalOnWCEvent({ children }: { children: React.ReactNode }) {
  const { open } = useModal();

  useEffect(() => {
    function handleEthSendTransaction({
      params,
      origin,
      onSuccess,
      onReject,
    }: EthSendEventPayload) {
      open(
        <WCSendTransactionModal params={params} origin={origin} onSuccess={onSuccess} />,
        onReject,
      );
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

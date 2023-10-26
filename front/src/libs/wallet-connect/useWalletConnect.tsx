import { useEffect, useState } from "react";
import { walletConnect } from "./wallet-connect";
import { SessionTypes } from "@walletconnect/types";

export default function useWalletConnect() {
  const [sessions, setSessions] = useState<Record<string, SessionTypes.Struct>>(
    walletConnect.sessions
  );

  const [disconnectIsLoading, setDisconnectIsLoading] = useState(false);
  const [disconnectError, setDisconnectError] = useState<Error | null>(null);

  const [extendIsLoading, setExtendIsLoading] = useState(false);
  const [extendError, setExtendError] = useState<Error | null>(null);

  const [updateIsLoading, setUpdateIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  useEffect(() => {
    const handleSessionsChanged = (
      newSessions: Record<string, SessionTypes.Struct>
    ) => {
      setSessions(newSessions);
    };

    walletConnect.on("sessionsChanged", handleSessionsChanged);
    return () => {
      walletConnect.removeListener("sessionsChanged", handleSessionsChanged);
    };
  }, []);

  async function disconnectSession(topic: string) {
    setDisconnectIsLoading(true);
    try {
      await walletConnect.disconnectSession(topic);
    } catch (error: any) {
      setDisconnectError(error);
    } finally {
      setDisconnectIsLoading(false);
    }
  }

  async function extendSession(topic: string) {
    setExtendIsLoading(true);

    try {
      await walletConnect.extendSession(topic);
    } catch (error: any) {
      setExtendError(error);
    } finally {
      setExtendIsLoading(false);
    }
  }

  async function updateSession({
    topic,
    namespaces,
  }: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }) {
    setUpdateIsLoading(true);

    try {
      await walletConnect.updateSession({
        topic,
        namespaces,
      });
    } catch (error: any) {
      setUpdateError(error);
    } finally {
      setUpdateIsLoading(false);
    }
  }

  return {
    sessions,
    disconnectIsLoading,
    disconnectError,
    extendIsLoading,
    extendError,
    updateIsLoading,
    updateError,
    disconnectSession,
    extendSession,
    updateSession,
  };
}

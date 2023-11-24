import { useEffect, useReducer, useState } from "react";
import {
  IPairingApprovedEventPayload,
  IPairingRejectedEventPayload,
  WCEvent,
  walletConnect,
} from "../service/wallet-connect";
import { SessionTypes } from "@walletconnect/types";
import { WC_CONFIG } from "../config";
import { on } from "events";
import { useMe } from "@/providers/MeProvider";

interface ISessions {
  [topic: string]: SessionTypes.Struct;
}

export interface IWCReactSession {
  session: SessionTypes.Struct;
  disconnectIsLoading: boolean;
  extendIsLoading: boolean;
  updateIsLoading: boolean;
  disconnectError: Error | null;
  extendError: Error | null;
  updateError: Error | null;
}

interface IWCReactSessions {
  [topic: string]: IWCReactSession;
}

interface IPairingState {
  pairingTopic: string;
  isLoading: boolean;
  error: Error | null;
}

type Action =
  | { type: "SET_DISCONNECT_LOADING"; topic: string }
  | { type: "SET_DISCONNECT_SUCCESS"; topic: string }
  | { type: "SET_DISCONNECT_ERROR"; topic: string; error: Error }
  | { type: "SET_EXTEND_LOADING"; topic: string }
  | { type: "SET_EXTEND_SUCCESS"; topic: string }
  | { type: "SET_EXTEND_ERROR"; topic: string; error: Error }
  | { type: "SET_UPDATE_LOADING"; topic: string }
  | { type: "SET_UPDATE_SUCCESS"; topic: string }
  | { type: "SET_UPDATE_ERROR"; topic: string; error: Error }
  | { type: "SET_SESSIONS"; sessions: ISessions };

function formatSessionsToReactSessions(sessions: ISessions): IWCReactSessions {
  return Object.entries(sessions).reduce(
    (acc, [topic, session]) => ({
      ...acc,
      [topic]: {
        session,
        disconnectIsLoading: false,
        extendIsLoading: false,
        updateIsLoading: false,
        disconnectError: null,
        extendError: null,
        updateError: null,
      },
    }),
    {},
  );
}

const reducer = (state: IWCReactSessions, action: Action): IWCReactSessions => {
  const topic = (action as { topic: string })?.topic;
  switch (action.type) {
    case "SET_DISCONNECT_LOADING":
    case "SET_DISCONNECT_SUCCESS":
    case "SET_DISCONNECT_ERROR":
      if (!state[topic]) return state;
      return {
        ...state,
        [topic]: {
          ...state[topic],
          disconnectIsLoading: action.type === "SET_DISCONNECT_LOADING",
          disconnectError: action.type === "SET_DISCONNECT_ERROR" ? action.error : null,
        },
      };
    case "SET_EXTEND_LOADING":
    case "SET_EXTEND_SUCCESS":
    case "SET_EXTEND_ERROR":
      if (!state[topic]) return state;
      return {
        ...state,
        [topic]: {
          ...state[topic],
          disconnectIsLoading: action.type === "SET_EXTEND_LOADING",
          disconnectError: action.type === "SET_EXTEND_ERROR" ? action.error : null,
        },
      };
    case "SET_UPDATE_LOADING":
    case "SET_UPDATE_SUCCESS":
    case "SET_UPDATE_ERROR":
      if (!state[topic]) return state;
      return {
        ...state,
        [topic]: {
          ...state[topic],
          disconnectIsLoading: action.type === "SET_UPDATE_LOADING",
          disconnectError: action.type === "SET_UPDATE_ERROR" ? action.error : null,
        },
      };
    case "SET_SESSIONS":
      const newFormattedSessions = formatSessionsToReactSessions(action.sessions);
      return {
        ...Object.keys(newFormattedSessions).reduce((acc, topic) => {
          if (!state[topic]) {
            acc[topic] = newFormattedSessions[topic];
            return acc;
          }

          const { session, ...rest } = state[topic];
          acc[topic] = {
            ...newFormattedSessions[topic],
            ...rest,
          };
          return acc;
        }, {} as IWCReactSessions),
      };
    default:
      return state;
  }
};

export function useWalletConnectHook() {
  const [isInitLoading, setIsInitLoading] = useState(false);
  const [isInitReady, setIsInitReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [pairingStates, setPairingStates] = useState<Record<string, IPairingState>>({});
  const [sessions, dispatch] = useReducer(reducer, {});
  const { me } = useMe();

  useEffect(() => {
    if (!me?.account) return;

    async function init(account: string) {
      try {
        setIsInitLoading(true);
        await walletConnect.init({
          walletConnectConfig: WC_CONFIG,
          smartWalletAddress: account,
        });
        setIsInitReady(true);
      } catch (error: any) {
        setInitError(error);
      } finally {
        setIsInitLoading(false);
      }
    }
    init(me.account);
    return () => {
      walletConnect.unsubscribe();
    };
  }, [me]);

  useEffect(() => {
    const handleSessionsChanged = (newSessions: ISessions) => {
      dispatch({ type: "SET_SESSIONS", sessions: newSessions });
    };
    const handlePairingApproved = ({ pairingTopic }: IPairingApprovedEventPayload) => {
      setPairingStates((prev) => ({
        ...prev,
        [pairingTopic]: {
          pairingTopic,
          isLoading: false,
          error: null,
        },
      }));
    };
    const handlePairingRejected = ({ pairingTopic, msg }: IPairingRejectedEventPayload) => {
      setPairingStates((prev) => ({
        ...prev,
        [pairingTopic]: {
          pairingTopic,
          isLoading: false,
          error: new Error(msg),
        },
      }));
    };
    walletConnect.on(WCEvent.sessionChanged, handleSessionsChanged);
    walletConnect.on(WCEvent.pairingApproved, handlePairingApproved);
    walletConnect.on(WCEvent.pairingRejected, handlePairingRejected);
    return () => {
      walletConnect.removeListener(WCEvent.sessionChanged, handleSessionsChanged);
      walletConnect.removeListener(WCEvent.pairingApproved, handlePairingApproved);
      walletConnect.removeListener(WCEvent.pairingRejected, handlePairingRejected);
    };
  }, []);

  async function pairSession({
    uri,
    onStart,
    onSuccess,
    onError,
  }: {
    uri: string;
    onStart?: (pairingTopic: string) => void;
    onSuccess?: (pairingTopic: string) => void;
    onError?: (error: any) => void;
  }) {
    let pairingTopic = "";
    try {
      pairingTopic = uri.split("@")[0].split(":")[1];
      onStart && onStart(pairingTopic);
      setPairingStates((prev) => ({
        ...prev,
        [pairingTopic]: {
          pairingTopic,
          isLoading: true,
          error: null,
        },
      }));

      await walletConnect.pair(uri);
      onSuccess && onSuccess(pairingTopic);
    } catch (error: any) {
      setPairingStates((prev) => ({
        ...prev,
        [pairingTopic]: {
          pairingTopic,
          isLoading: false,
          error: error,
        },
      }));
      onError && onError(error);
    }
  }

  async function disconnectSession(topic: string) {
    dispatch({ type: "SET_DISCONNECT_LOADING", topic });
    try {
      await walletConnect.disconnectSession(topic);
      dispatch({ type: "SET_DISCONNECT_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_DISCONNECT_ERROR", topic, error });
    }
  }

  async function extendSession(topic: string) {
    dispatch({ type: "SET_EXTEND_LOADING", topic });
    try {
      await walletConnect.extendSession(topic);
      dispatch({ type: "SET_EXTEND_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_EXTEND_ERROR", topic, error });
    }
  }

  async function updateSession({
    topic,
    namespaces,
  }: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }) {
    dispatch({ type: "SET_UPDATE_LOADING", topic });
    try {
      await walletConnect.updateSession({
        topic,
        namespaces,
      });
      dispatch({ type: "SET_UPDATE_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_UPDATE_ERROR", topic, error });
    }
  }

  return {
    isInitLoading,
    isInitReady,
    initError,
    sessions,
    pairingStates,
    pairSession,
    disconnectSession,
    extendSession,
    updateSession,
  };
}

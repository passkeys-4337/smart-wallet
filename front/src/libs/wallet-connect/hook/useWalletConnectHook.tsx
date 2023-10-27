import { useEffect, useReducer, useState } from "react";
import { walletConnect } from "../service/wallet-connect";
import { SessionTypes } from "@walletconnect/types";
import { WC_CONFIG } from "../config";

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
  uri: string;
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
        isLoading: false,
        error: null,
      },
    }),
    {}
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
          disconnectError:
            action.type === "SET_DISCONNECT_ERROR" ? action.error : null,
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
          disconnectError:
            action.type === "SET_EXTEND_ERROR" ? action.error : null,
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
          disconnectError:
            action.type === "SET_UPDATE_ERROR" ? action.error : null,
        },
      };
    case "SET_SESSIONS":
      const newFormattedSessions = formatSessionsToReactSessions(
        action.sessions
      );
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
  const [pairingState, setPairingState] = useState<
    Record<string, IPairingState>
  >({});

  const [sessions, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    async function init() {
      try {
        setIsInitLoading(true);
        await walletConnect.init(WC_CONFIG);
        setIsInitReady(true);
      } catch (error: any) {
        setInitError(error);
      } finally {
        setIsInitLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    console.log("useWalletConnect: first render");
    const handleSessionsChanged = (newSessions: ISessions) => {
      dispatch({ type: "SET_SESSIONS", sessions: newSessions });
    };
    walletConnect.on("sessionsChanged", handleSessionsChanged);
    return () => {
      walletConnect.removeListener("sessionsChanged", handleSessionsChanged);
    };
  }, []);

  async function pairSession(uri: string) {
    setPairingState((prev) => ({
      ...prev,
      [uri]: {
        uri,
        isLoading: true,
        error: null,
      },
    }));
    try {
      await walletConnect.pair(uri);
      setPairingState((prev) => ({
        ...prev,
        [uri]: {
          uri,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error: any) {
      setPairingState((prev) => ({
        ...prev,
        [uri]: {
          uri,
          isLoading: false,
          error,
        },
      }));
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
    pairingState,
    pairSession,
    disconnectSession,
    extendSession,
    updateSession,
  };
}

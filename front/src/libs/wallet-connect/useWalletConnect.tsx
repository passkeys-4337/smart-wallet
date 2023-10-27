import { useEffect, useReducer, useState } from "react";
import { walletConnect } from "./wallet-connect";
import { SessionTypes } from "@walletconnect/types";

interface ISessions {
  [topic: string]: SessionTypes.Struct;
}

interface IWCReactSession {
  session: SessionTypes.Struct;
  isLoading: boolean;
  error: Error | null;
}

interface IWCReactSessions {
  [topic: string]: IWCReactSession;
}

type Action =
  | { type: "SET_LOADING"; topic: string }
  | { type: "SET_SUCCESS"; topic: string }
  | { type: "SET_ERROR"; topic: string; error: Error }
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
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        [action.topic]: {
          ...state[action.topic],
          isLoading: true,
        },
      };
    case "SET_SUCCESS":
      return {
        ...state,
        [action.topic]: {
          ...state[action.topic],
          isLoading: false,
          error: null,
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        [action.topic]: {
          ...state[action.topic],
          isLoading: false,
          error: action.error,
        },
      };
    case "SET_SESSIONS":
      const newFormattedSessions = formatSessionsToReactSessions(
        action.sessions
      );
      return {
        ...state,
        ...Object.keys(newFormattedSessions).reduce((acc, topic) => {
          acc[topic] = {
            ...newFormattedSessions[topic],
            ...state[topic], // preserve isLoading and error from current state
          };
          return acc;
        }, {} as IWCReactSessions),
      };
    default:
      return state;
  }
};

export function useWalletConnect() {
  const [sessions, dispatch] = useReducer(
    reducer,
    formatSessionsToReactSessions(walletConnect.sessions)
  );

  useEffect(() => {
    const handleSessionsChanged = (newSessions: ISessions) => {
      dispatch({ type: "SET_SESSIONS", sessions: newSessions });
    };
    walletConnect.on("sessionsChanged", handleSessionsChanged);
    return () => {
      walletConnect.removeListener("sessionsChanged", handleSessionsChanged);
    };
  }, []);

  async function disconnectSession(topic: string) {
    dispatch({ type: "SET_LOADING", topic });
    try {
      await walletConnect.disconnectSession(topic);
      dispatch({ type: "SET_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", topic, error });
    }
  }

  async function extendSession(topic: string) {
    dispatch({ type: "SET_LOADING", topic });
    try {
      await walletConnect.extendSession(topic);
      dispatch({ type: "SET_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", topic, error });
    }
  }

  async function updateSession({
    topic,
    namespaces,
  }: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }) {
    dispatch({ type: "SET_LOADING", topic });
    try {
      await walletConnect.updateSession({
        topic,
        namespaces,
      });
      dispatch({ type: "SET_SUCCESS", topic });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", topic, error });
    }
  }

  return {
    sessions,
    disconnectSession,
    extendSession,
    updateSession,
  };
}

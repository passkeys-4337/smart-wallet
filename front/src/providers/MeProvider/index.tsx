"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Address, Hex, toHex } from "viem";
import { WebAuthn } from "@/libs/web-authn/service/web-authn";
import { saveUser } from "@/libs/factory";
import { getUser } from "@/libs/factory/getUser";

export type Me = {
  account: Address;
  keyId: Hex;
  pubKey: {
    x: Hex;
    y: Hex;
  };
};

function useMeHook() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [isReturning, setIsReturning] = useState(
    Boolean(localStorage.getItem("hocuspocus.returning")),
  );

  function disconnect() {
    localStorage.removeItem("hocuspocus.me");
    setMe(null);
  }

  async function create(username: string) {
    setIsLoading(true);
    try {
      const credential = await WebAuthn.create({ username });

      if (!credential) {
        return;
      }
      const user = await saveUser({
        id: credential.rawId,
        pubKey: credential.pubKey,
      });

      const me = {
        keyId: user.id as Hex,
        pubKey: user.pubKey,
        account: user.account,
      };

      if (me === undefined) {
        console.log("error while saving user");
        return;
      }
      localStorage.setItem("hocuspocus.me", JSON.stringify(me));
      localStorage.setItem("hocuspocus.returning", "true");
      setIsReturning(true);
      setMe(me);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function get() {
    setIsLoading(true);
    try {
      const credential = await WebAuthn.get();
      if (!credential) {
        return;
      }
      const user = await getUser(credential.rawId);
      const me = {
        keyId: user.id as Hex,
        pubKey: user.pubKey,
        account: user.account,
      };

      localStorage.setItem("hocuspocus.me", JSON.stringify(me));
      localStorage.setItem("hocuspocus.returning", "true");
      setIsReturning(true);
      setMe(me);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const me = localStorage.getItem("hocuspocus.me");
    if (!me) {
      return;
    }
    setMe(JSON.parse(me));
  }, []);
  return {
    isLoading,
    me,
    returning: isReturning,
    create,
    get,
    disconnect,
  };
}

type UseMeHook = ReturnType<typeof useMeHook>;
const MeContext = createContext<UseMeHook | null>(null);

export const useMe = (): UseMeHook => {
  const context = useContext(MeContext);
  if (!context) {
    throw new Error("useMeHook must be used within a MeProvider");
  }
  return context;
};

export function MeProvider({ children }: { children: React.ReactNode }) {
  const hook = useMeHook();

  return <MeContext.Provider value={hook}>{children}</MeContext.Provider>;
}

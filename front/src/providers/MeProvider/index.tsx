"use client";

import { createContext, useContext, useState } from "react";
import { Hex } from "viem";
import { WebAuthn } from "@/libs/web-authn/service/web-authn";

type Me = {
  keyId: Hex;
};

function useMeHook() {
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  function disconnect() {
    localStorage.removeItem("me");
    setMe(null);
  }

  async function create(username: string) {
    setIsLoading(true);
    // const { rawId, pubKey } = await WebAuthn.create({ username });

    // localStorage.setItem(
    //   "user",
    //   JSON.stringify({
    //     id: toHex(new Uint8Array(cred.rawId)),
    //     username,
    //     address: "0x000",
    //   }),
    // );

    localStorage.setItem(
      "hasWebAuthn",
      JSON.stringify({
        hasWebAuthn: true,
      }),
    );
  }

  function get() {}

  return {
    // TODO: replace this with the keyId provided by the auth context
    // this is the keyId for bigq
    keyId: "0x9e925f1ff5b39500f805ff205534b589c72603c740b3de6975511818095eec36" as Hex,
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

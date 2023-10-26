"use client";

import { useEffect, useState } from "react";
import WebAuthn, { CreateCredential, P256Credential } from "../libs/webauthn";
import { stringify } from "@/utils/stringify";
import { create } from "domain";
import { Hex } from "viem";

const webauthn = new WebAuthn();

export default function PassKey() {
  const [username, setUsername] = useState<string>("super-user");
  const [createCredential, setCreateCredential] = useState<{
    rawId: Hex;
    pubKey: CryptoKey;
  } | null>(null);
  const [credential, setCredential] = useState<P256Credential | null>(null);

  function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  async function onCreate() {
    let credential = await webauthn.create({ username });
    let pubKey: CryptoKey = await crypto.subtle.importKey(
      "spki",
      credential?.pubKey as ArrayBuffer,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"],
    );

    console.log("PUB KEY", await crypto.subtle.exportKey("jwk", pubKey));

    setCreateCredential({
      rawId: credential?.rawId as Hex,
      pubKey,
    });
  }

  async function onGet() {
    setCredential(await webauthn.get());
  }

  return (
    <>
      <div style={{ content: "center", margin: 20 }}>
        <input
          type="outlined"
          name="username"
          autoComplete="webauthn"
          value={username}
          onChange={onUsernameChange}
        />
        <button onClick={onCreate}>Create</button>
        <button onClick={onGet}>Get</button>
      </div>
      {createCredential && (
        <div style={{ content: "center", margin: 20 }}>{stringify(createCredential)}</div>
      )}
      {credential && <div style={{ content: "center", margin: 20 }}>{stringify(credential)}</div>}
    </>
  );
}

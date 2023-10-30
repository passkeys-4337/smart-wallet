"use client";

import { useState } from "react";
import { WebAuthn, P256Credential } from "../libs/webauthn";
import { stringify } from "@/utils/stringify";
import { Hex } from "viem";

const webauthn = new WebAuthn();

export default function PassKey() {
  const [username, setUsername] = useState<string>("");
  const [createCredential, setCreateCredential] = useState<{
    rawId: Hex;
    pubKey: {
      x: Hex;
      y: Hex;
    };
  } | null>(null);
  const [credential, setCredential] = useState<P256Credential | null>(null);

  function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  async function onCreate() {
    let credential = await webauthn.create({ username });

    setCreateCredential({
      rawId: credential?.rawId as Hex,
      pubKey: credential?.pubKey as { x: Hex; y: Hex },
    });
  }

  async function onGet() {
    setCredential(await webauthn.get());
  }

  return (
    <>
      <h3>PassKey</h3>
      <div style={{ content: "center", margin: 20 }}>
        <input
          type="text"
          name="username"
          autoComplete="username webauthn"
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

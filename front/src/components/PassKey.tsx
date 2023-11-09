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
    setCredential(
      await webauthn.get(
        `0x01000000000000${"72fe91f1b68f75ce391ac973c52d8c525356199dbc5bef6c7bc6f8e2308ead87"}`,
      ),
    );
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
      {credential && (
        <div style={{ content: "center", margin: 20 }}>{stringify(credential, null, 2)}</div>
      )}
    </>
  );
}

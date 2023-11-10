"use client";

import { useState } from "react";
import { WebAuthn, P256Credential } from "../libs/web-authn/service/web-authn";
import { stringify } from "@/utils/stringify";
import { Hex } from "viem";
import { saveUser } from "@/libs/factory";
import { getUser } from "@/libs/factory/getUser";

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
    const res = await saveUser({
      id: credential?.rawId as Hex,
      pubKey: credential?.pubKey as { x: Hex; y: Hex },
    });

    setCreateCredential({
      rawId: credential?.rawId as Hex,
      pubKey: credential?.pubKey as { x: Hex; y: Hex },
    });
  }

  async function onGet() {
    const cred = await webauthn.get(
      `0x01000000000000${"72fe91f1b68f75ce391ac973c52d8c525356199dbc5bef6c7bc6f8e2308ead87"}`,
    );
    setCredential(cred);

    const user = await getUser(cred?.rawId as Hex);
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

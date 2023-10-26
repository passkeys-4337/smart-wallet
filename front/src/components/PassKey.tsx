"use client";

import { useEffect, useState } from "react";
import WebAuthn from "../libs/webauthn";

const webauthn = new WebAuthn();

function arrayBufferToString(buffer: ArrayBuffer) {
  let str = "";
  const array = new Uint8Array(buffer);
  for (let i = 0; i < array.length; i++) {
    str += String.fromCharCode(array[i]);
  }
  return str;
}

export default function PassKey() {
  const [username, setUsername] = useState<string>("super-user");
  const [credential, setCredential] = useState<Credential | null>(null);
  const [clientDataJson, setClientDataJson] = useState<string | null>(null);

  function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  async function onCreate() {
    setCredential(await webauthn.create({ username }));
  }

  async function onGet() {
    setCredential(await webauthn.get());
  }

  useEffect(() => {
    let cred = credential as unknown as { response: { clientDataJSON: ArrayBuffer } };
    console.log("cred", cred);
    let clientDataJson = arrayBufferToString(cred?.response?.clientDataJSON);
    setClientDataJson(clientDataJson);
    let challenge = JSON.parse(JSON.stringify(clientDataJson)) as { challenge: string };
    console.log("client data json", clientDataJson);
    console.log("challenge", challenge?.challenge);
  }, [credential, clientDataJson]);

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
      {credential && (
        <div style={{ content: "center", margin: 20 }}>
          ClientDataJSON: {JSON.stringify(clientDataJson, null, 2)}
        </div>
      )}
    </>
  );
}

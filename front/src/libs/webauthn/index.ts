import crypto from "crypto";
import { Hex, Signature, toHex } from "viem";
import cbor from "cbor";

function arrayBufferToString(buffer: ArrayBuffer) {
  let str = "";
  const array = new Uint8Array(buffer);
  for (let i = 0; i < array.length; i++) {
    str += String.fromCharCode(array[i]);
  }
  return str;
}

function arrayBufferToHex(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromBase64ToHex(str: string) {
  const buffer = Buffer.from(str, "base64");
  return buffer.toString("hex");
}

function extractIntegersFromDERSignature(buffer: ArrayBuffer): { r: Hex; s: Hex } {
  const data = new Uint8Array(buffer);

  // Validate SEQUENCE
  if (data[0] !== 0x30 || data.length < 2) {
    throw new Error("Invalid DER signature");
  }

  // Retrieve length of R and S
  const rLength = data[3];
  const sLength = data[5 + rLength];

  // Extract the R and S integers
  const r = toHex(data.slice(4, 4 + rLength));
  const s = toHex(data.slice(6 + sLength));

  return { r, s };
}

function getPublicKey(authData: Uint8Array): { x: Hex; y: Hex } {
  // get the length of the credential ID
  const dataView = new DataView(new ArrayBuffer(2));
  const idLenBytes = authData.slice(53, 55);
  console.log("idLenBytes", idLenBytes);
  idLenBytes.forEach((value, index) => {
    console.log("data viexw", dataView);
    dataView.setUint8(index, value);
  });
  console.log("DATA VIEW: ", dataView);
  const credentialIdLength = dataView.getUint8(0);

  // get the public key object
  const publicKeyBytes = authData.slice(55 + credentialIdLength);

  console.log("PUBLIC KEY BYTES: ", publicKeyBytes);

  // the publicKeyBytes are encoded again as CBOR
  const publicKeyObject: { "-2": Uint8Array; "-3": Uint8Array } = cbor.decode(
    publicKeyBytes.buffer,
  );

  console.log("PUBLIC KEY OBJECT: ", publicKeyObject);

  const aaa = authData.slice(37, 37 + 65);
  console.log("AAA: ", aaa);

  return {
    x: toHex(publicKeyObject["-2"]),
    y: toHex(publicKeyObject["-3"]),
  };
}

export type CreateCredential = {
  rawId: Hex;
  pubKey: ArrayBuffer;
};

export type P256Credential = {
  rawId: Hex;
  clientData: {
    type: string;
    challenge: string;
    origin: string;
  };
  authenticatorData: Hex;
  signature: P256Signature;
};

export type P256Signature = {
  r: Hex;
  s: Hex;
};

export default class WebAuthn {
  private _generateRandomBytes(): Buffer {
    return crypto.randomBytes(16);
  }

  async create({ username }: { username: string }): Promise<CreateCredential | null> {
    const options: PublicKeyCredentialCreationOptions = {
      timeout: 60000,
      rp: {
        name: "hocuspocusxyz",
        id: "localhost",
      },
      user: {
        id: this._generateRandomBytes(),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
      ],
      authenticatorSelection: {
        requireResidentKey: true,
        userVerification: "required",
      },
      attestation: "direct",
      challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    };

    const credential = await navigator.credentials.create({
      publicKey: options,
    });

    if (!credential) {
      return null;
    }

    console.log("CREATE CREDENTIAL: ", credential);
    let cred = credential as unknown as {
      rawId: ArrayBuffer;
      response: {
        clientDataJSON: ArrayBuffer;
        attestationObject: ArrayBuffer;
        getPublicKey: () => any;
      };
    };

    const decodedAttestationObj = cbor.decode(cred.response.attestationObject);
    console.log("DECODED ATTESTATION OBJ: ", decodedAttestationObj);

    const { authData } = decodedAttestationObj;
    const pubKey = cred.response.getPublicKey();

    console.log("pub key ", pubKey);

    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      pubKey,
    };
  }

  async get(): Promise<P256Credential | null> {
    const options: PublicKeyCredentialRequestOptions = {
      timeout: 60000,
      challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
      rpId: "localhost",
      userVerification: "required",
    };

    const credential = await navigator.credentials.get({
      publicKey: options,
    });

    if (!credential) {
      return null;
    }

    let cred = credential as unknown as {
      rawId: ArrayBuffer;
      response: {
        clientDataJSON: ArrayBuffer;
        authenticatorData: ArrayBuffer;
        signature: ArrayBuffer;
      };
    };

    const utf8Decoder = new TextDecoder("utf-8");
    const decodedClientData = utf8Decoder.decode(cred.response.clientDataJSON);
    const clientDataObj = JSON.parse(decodedClientData);

    let authenticatorData = toHex(new Uint8Array(cred.response.authenticatorData));

    let signature = extractIntegersFromDERSignature(cred?.response?.signature as ArrayBuffer);
    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      clientData: {
        type: clientDataObj.type,
        challenge: clientDataObj.challenge,
        origin: clientDataObj.origin,
      },
      authenticatorData,
      signature,
    };
  }
}

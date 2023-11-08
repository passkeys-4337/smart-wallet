import crypto from "crypto";
import { Hex, toHex } from "viem";
import cbor from "cbor";
import { parseAuthenticatorData } from "@simplewebauthn/server/helpers";
import { AsnParser } from "@peculiar/asn1-schema";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { concatUint8Arrays } from "@/utils/arrayConcat";
import { CreateCredential, P256Credential, P256Signature } from "@/libs/webauthn/types";
import { shouldRemoveLeadingZero } from "@/utils/removeLeadingZero";

export * from "@/libs/webauthn/types";

export class WebAuthn {
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

    let cred = credential as unknown as {
      rawId: ArrayBuffer;
      response: {
        clientDataJSON: ArrayBuffer;
        attestationObject: ArrayBuffer;
      };
    };

    // decode attestation object and get public key
    const decodedAttestationObj = cbor.decode(cred.response.attestationObject);
    const authData = parseAuthenticatorData(decodedAttestationObj.authData);
    const publicKey = cbor.decode(authData?.credentialPublicKey?.buffer as ArrayBuffer);
    const x = toHex(publicKey.get(-2));
    const y = toHex(publicKey.get(-3));

    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      pubKey: {
        x,
        y,
      },
    };
  }

  async get(challenge: Hex): Promise<P256Credential | null> {
    const options: PublicKeyCredentialRequestOptions = {
      timeout: 60000,
      challenge: Buffer.from(challenge.slice(2), "hex"),
      rpId: "localhost",
      userVerification: "required",
      mediation: "conditional",
    } as PublicKeyCredentialRequestOptions;

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
    let signature = parseSignature(new Uint8Array(cred?.response?.signature));

    return {
      rawId: toHex(new Uint8Array(cred.rawId)),
      clientData: {
        type: clientDataObj.type,
        challenge: clientDataObj.challenge,
        origin: clientDataObj.origin,
        crossOrigin: clientDataObj.crossOrigin,
      },
      authenticatorData,
      signature,
    };
  }
}

// Parse the signature from the authenticator and remove the leading zero if necessary
export function parseSignature(signature: Uint8Array): P256Signature {
  const parsedSignature = AsnParser.parse(signature, ECDSASigValue);
  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);
  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }
  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }
  const finalSignature = concatUint8Arrays([rBytes, sBytes]);
  return {
    r: toHex(finalSignature.slice(0, 32)),
    s: toHex(finalSignature.slice(32)),
  };
}

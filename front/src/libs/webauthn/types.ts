import { Hex } from "viem";

export type CreateCredential = {
  rawId: Hex;
  pubKey: {
    x: Hex;
    y: Hex;
  };
};

export type P256Credential = {
  rawId: Hex;
  clientData: {
    type: string;
    challenge: string;
    origin: string;
    crossOrigin: boolean;
  };
  authenticatorData: Hex;
  signature: P256Signature;
};

export type P256Signature = {
  r: Hex;
  s: Hex;
};

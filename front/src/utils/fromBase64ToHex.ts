import { Hex, toHex } from "viem";

export function fromBase64ToHex(str: string): Hex {
  const buffer = Buffer.from(str, "base64");
  return toHex(buffer);
}

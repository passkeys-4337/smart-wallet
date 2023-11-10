import { Hex } from "viem";

export async function saveUser({ id, pubKey }: { id: Hex; pubKey: { x: Hex; y: Hex } }) {
  const response = await fetch("/api/users/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, pubKey: [pubKey.x, pubKey.y] }),
  });

  const res = await response.json();
  console.log(res);

  return res;
}

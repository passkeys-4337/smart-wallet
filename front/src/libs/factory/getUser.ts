import { Address, Hex } from "viem";

export async function getUser(
  id: Hex,
): Promise<{ id: Hex; pubKey: { x: Hex; y: Hex }; account: Address }> {
  const response = await fetch(`/api/users/${id}`, {
    method: "GET",
  });

  const user = await response.json();
  return {
    id: user.id,
    pubKey: {
      x: user.publicKey[0],
      y: user.publicKey[1],
    },
    account: user.account,
  };
}

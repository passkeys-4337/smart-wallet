import { Address, Hex } from "viem";

export type User = { id: Hex; pubKey: { x: Hex; y: Hex }; account: Address; balance: bigint };

export async function getUser(id: Hex): Promise<User> {
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
    balance: user.balance,
  };
}

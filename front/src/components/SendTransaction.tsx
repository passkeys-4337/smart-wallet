"use client";

import { Hex, PublicClient, createPublicClient, http, parseEther } from "viem";
import { useSendTransaction, useWaitForTransaction } from "wagmi";

import { stringify } from "../utils/stringify";
import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { baseGoerli } from "viem/chains";
import { SmartWalletProvider } from "@/libs/smart-wallet/SmartWalletProvider";
import { smartWallet } from "@/libs/smart-wallet";

const builder = new UserOpBuilder(baseGoerli);

export function SendTransaction() {
  const { data, error, isLoading, isError, sendTransaction } = useSendTransaction();
  const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
  } = useWaitForTransaction({ hash: data?.hash });

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const address = formData.get("address") as Hex;
          const value = formData.get("value") as `${number}`;
          // sendTransaction({
          //   to: address,
          //   value: parseEther(value),
          // });

          // builder.buildUserOp({
          //   to: "0x061060a65146b3265C62fC8f3AE977c9B27260fF",
          //   value: BigInt(0),
          // });
          // const { userOp, userOpHash } = await builder.buildUserOp({
          //   to: "0x061060a65146b3265C62fC8f3AE977c9B27260fF",
          //   value: BigInt(0),
          // });

          // console.log("djshcds", builder.toParams(userOp));

          const res = await smartWallet.client.sendUserOperation({
            to: "0x061060a65146b3265C62fC8f3AE977c9B27260fF",
            value: BigInt(0),
          });

          console.log("res", res);
        }}
      >
        <input name="address" placeholder="address" />
        <input name="value" placeholder="value (ether)" />
        <button type="submit">Send</button>
      </form>

      {isLoading && <div>Check wallet...</div>}
      {isPending && <div>Transaction pending...</div>}
      {isSuccess && (
        <>
          <div>Transaction Hash: {data?.hash}</div>
          <div>
            Transaction Receipt: <pre>{stringify(receipt, null, 2)}</pre>
          </div>
        </>
      )}
      {isError && <div>Error: {error?.message}</div>}
    </>
  );
}

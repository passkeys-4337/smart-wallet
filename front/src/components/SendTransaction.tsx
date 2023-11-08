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

          const res = await smartWallet.client.sendUserOperation({
            to: address ?? "0x1878EA9134D500A3cEF3E89589ECA3656EECf48f",
            value: value ?? BigInt(11),
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

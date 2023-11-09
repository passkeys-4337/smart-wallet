"use client";

import { Hex, PublicClient, createPublicClient, http, parseEther } from "viem";
import { useSendTransaction, useWaitForTransaction } from "wagmi";

import { stringify } from "../utils/stringify";
import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { baseGoerli } from "viem/chains";
import { SmartWalletProvider } from "@/libs/smart-wallet/SmartWalletProvider";
import { smartWallet } from "@/libs/smart-wallet";
import { useState } from "react";
import { Link } from "@radix-ui/themes";
import LoadingSpinner from "@/components/LoadingSpinner";

const builder = new UserOpBuilder(baseGoerli);
smartWallet.init();

export function SendTransaction() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <form
        onSubmit={async (e) => {
          setIsLoading(true);
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const address = formData?.get("address") as Hex;
          const value = formData?.get("value") as `${number}`;

          const hash = await smartWallet.sendUserOperation({
            to: address || "0x1878EA9134D500A3cEF3E89589ECA3656EECf48f",
            value: value || BigInt(11),
          });

          const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
          setTxReceipt(receipt);

          setIsLoading(false);
        }}
      >
        <input name="address" placeholder="address" />
        <input name="value" placeholder="value (ether)" />
        <button type="submit">Send</button>
      </form>

      {isLoading && <LoadingSpinner />}

      {txReceipt && !isLoading && (
        <Link
          href={`https://goerli.basescan.org/tx/${txReceipt.receipt.transactionHash}`}
          target="_blank"
        >
          Tx Link
        </Link>
      )}
    </>
  );
}

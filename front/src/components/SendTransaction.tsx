"use client";

import { Chain, EstimateFeesPerGasReturnType, Hex, toHex } from "viem";
import { smartWallet } from "@/libs/smart-wallet";
import { useEffect, useState } from "react";
import { Link } from "@radix-ui/themes";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserOpBuilder, emptyHex } from "@/libs/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";

smartWallet.init();
const builder = new UserOpBuilder(smartWallet.client.chain as Chain);

export function SendTransaction() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const KEY_ID = "0x9e925f1ff5b39500f805ff205534b589c72603c740b3de6975511818095eec36";

  return (
    <>
      <form
        onSubmit={async (e) => {
          setIsLoading(true);
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const address = formData?.get("address") as Hex;
          const value = formData?.get("value") as `${number}`;

          const { maxFeePerGas, maxPriorityFeePerGas }: EstimateFeesPerGasReturnType =
            await smartWallet.client.estimateFeesPerGas();

          const userOp = await builder.buildUserOp({
            calls: [
              {
                dest: address || "0x1878EA9134D500A3cEF3E89589ECA3656EECf48f",
                value: BigInt(value) || BigInt(11),
                data: emptyHex,
              },
            ],
            maxFeePerGas: maxFeePerGas as bigint,
            maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
            // TODO: replace this with the keyId provided by the auth context
            // this is the keyId for bigq
            keyId: KEY_ID,
          });

          const hash = await smartWallet.sendUserOperation({ userOp });
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

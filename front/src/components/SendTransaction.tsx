"use client";

import { Chain, EstimateFeesPerGasReturnType, Hex, toHex } from "viem";
import { smartWallet } from "@/libs/smart-wallet";
import { useEffect, useState } from "react";
import { Flex, Link, TextFieldInput, Button } from "@radix-ui/themes";
import { UserOpBuilder, emptyHex } from "@/libs/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useMe } from "@/providers/MeProvider";

smartWallet.init();
const builder = new UserOpBuilder(smartWallet.client.chain as Chain);

export function SendTransaction() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { keyId } = useMe();

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
            keyId,
          });

          const hash = await smartWallet.sendUserOperation({ userOp });
          const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
          setTxReceipt(receipt);

          setIsLoading(false);
        }}
      >
        <Flex direction="column" gap="2" style={{ marginInline: "4rem", marginTop: "2rem" }}>
          <TextFieldInput name="address" placeholder="address" />
          <TextFieldInput name="value" placeholder="value (ether)" />
          <Button type="submit">Send</Button>
        </Flex>
      </form>

      {isLoading && (
        <Flex justify="center" style={{ marginTop: "1rem" }}>
          {" "}
          <ReloadIcon className="spinner" />
        </Flex>
      )}

      {txReceipt && !isLoading && (
        <>
          <Flex justify="center" style={{ marginTop: "1rem" }}>
            <Link
              href={`https://goerli.basescan.org/tx/${txReceipt.receipt.transactionHash}`}
              target="_blank"
            >
              Tx Link
            </Link>
          </Flex>
        </>
      )}
    </>
  );
}

"use client";

import { Chain, EstimateFeesPerGasReturnType, Hex } from "viem";
import { smartWallet } from "@/libs/smart-wallet";
import { useState } from "react";
import {
  Flex,
  Link,
  TextFieldInput,
  Button,
  Heading,
  Text,
  TextField,
  TextFieldRoot,
  TextFieldSlot,
} from "@radix-ui/themes";
import { UserOpBuilder, emptyHex } from "@/libs/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";
import { CheckCircledIcon, CheckIcon, ExternalLinkIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useMe } from "@/providers/MeProvider";

smartWallet.init();
const builder = new UserOpBuilder(smartWallet.client.chain as Chain);

export function SendTransaction() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { me } = useMe();
  const { balance } = useBalance();

  const submitTx = async (e: any) => {
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
      keyId: me?.keyId as Hex,
    });

    const hash = await smartWallet.sendUserOperation({ userOp });
    const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
    setTxReceipt(receipt);

    setIsLoading(false);
  };

  return (
    <Flex direction="column" style={{ flexGrow: 1, width: "100%", padding: "1rem" }}>
      {!txReceipt && !isLoading && (
        <Heading size="3" style={{ color: "var(--accent-9)" }}>
          Send Transaction
        </Heading>
      )}
      {!txReceipt && !isLoading && (
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            flexGrow: 1,
            padding: "2rem 0",
          }}
          onSubmit={async (e) => await submitTx(e)}
        >
          <Flex direction="column">
            <Flex direction="column" gap="2">
              <TextField.Input
                name="address"
                placeholder="address"
                style={{ paddingInline: "0.5rem" }}
              />
              <Flex direction="row" gap="2" width="100%">
                <TextFieldRoot>
                  <TextFieldInput
                    name="value"
                    placeholder="value ($)"
                    style={{ paddingInline: "0.5rem" }}
                  />
                  <TextFieldSlot>
                    <Text weight="bold" style={{ alignSelf: "center" }}>
                      USD
                    </Text>
                  </TextFieldSlot>
                </TextFieldRoot>
              </Flex>
              <Text size="2" weight="bold" style={{ paddingInline: "0.5rem" }}>
                ${balance.toString().slice(0, 4)} available
              </Text>
            </Flex>
          </Flex>
          <Button type="submit">Send</Button>
        </form>
      )}

      {isLoading && (
        <Flex direction="column" justify="center" align="center" grow="1" gap="5">
          <ReloadIcon height="30" width="100%" className="spinner" />
          <Text size="2" weight="bold">
            Sending transaction...
          </Text>
        </Flex>
      )}

      {txReceipt && !isLoading && (
        <>
          <Flex direction="column" justify="center" align="center" grow="1" gap="5">
            <CheckCircledIcon height="50" width="100%" color="var(--teal-11)" />
            <Link
              // href={`https://goerli.basescan.org/tx/${txReceipt.receipt.transactionHash}`}
              href={`https://goerli.basescan.org/tx/${"0xfc67bb936e6637388ec01e3f2889615b21ed6cf67a58a82265255435546d4d36"}`}
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <Flex direction="row" gap="2" style={{ color: "var(--teal-11)" }}>
                See transaction
                <ExternalLinkIcon style={{ alignSelf: "center", color: "var(--teal-11)" }} />
              </Flex>
            </Link>
          </Flex>
        </>
      )}
    </Flex>
  );
}

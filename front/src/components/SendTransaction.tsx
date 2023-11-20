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
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useMe } from "@/providers/MeProvider";
import * as Form from "@radix-ui/react-form";
import Spinner from "./Spinner";

smartWallet.init();
const builder = new UserOpBuilder(smartWallet.client.chain as Chain);

export function SendTransaction() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { me } = useMe();
  const { balance, refreshBalance } = useBalance();

  const submitTx = async (e: any) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const address = formData?.get("address") as Hex;
      const usdAmount = formData?.get("amount") as `${number}`;

      const price: { ethereum: { usd: number } } = await (
        await fetch("/api/price?ids=ethereum&currencies=usd")
      ).json();

      const { maxFeePerGas, maxPriorityFeePerGas }: EstimateFeesPerGasReturnType =
        await smartWallet.client.estimateFeesPerGas();

      const userOp = await builder.buildUserOp({
        calls: [
          {
            dest: address.toLowerCase() as Hex,
            value:
              (BigInt(usdAmount) * BigInt(1e18)) / (BigInt(price.ethereum.usd * 100) / BigInt(100)), // 100 is the price precision
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
    } catch (e) {
      console.error(e);
      setError("Something went wrong!");
    } finally {
      setIsLoading(false);
      refreshBalance();
    }
  };

  return (
    <Flex direction="column" style={{ flexGrow: 1, width: "100%", padding: "1rem" }}>
      {!txReceipt && !isLoading && (
        <Heading size="3" style={{ color: "var(--accent-9)" }}>
          Send Transaction
        </Heading>
      )}
      {!txReceipt && !isLoading && (
        <Form.Root
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
          <Flex direction="column" gap="2">
            <Flex direction="column" gap="3">
              <Form.Field
                name="address"
                style={{
                  paddingInline: "0.5rem",
                }}
              >
                <Flex direction="column" gap="1">
                  <Flex direction="row" justify="between" gap="2">
                    <Form.Label>To</Form.Label>
                    <Form.Message match="valueMissing" style={{ color: "var(--accent-9)" }}>
                      Please enter a recipient address!
                    </Form.Message>
                    <Form.Message match="patternMismatch" style={{ color: "var(--accent-9)" }}>
                      Please provide a valid address!
                    </Form.Message>
                  </Flex>
                  <Form.Control asChild>
                    <TextFieldInput required pattern="^0x[a-fA-F0-9]{40}$" placeholder="0x..." />
                  </Form.Control>
                </Flex>
              </Form.Field>
              <Form.Field name="amount" defaultValue={0} style={{ paddingInline: "0.5rem" }}>
                <Flex direction="column" gap="1">
                  <Flex direction="row" justify="between" gap="2">
                    <Form.Label>Amount (USD)</Form.Label>
                    <Form.Message match="valueMissing" style={{ color: "var(--accent-9)" }}>
                      Please enter a value!
                    </Form.Message>
                    <Form.Message match="typeMismatch" style={{ color: "var(--accent-9)" }}>
                      Please provide a valid value!
                    </Form.Message>
                    <Form.Message match="rangeOverflow" style={{ color: "var(--accent-9)" }}>
                      Insufficient balance!
                    </Form.Message>
                  </Flex>
                  <Flex direction="column" gap="2">
                    <Form.Control asChild>
                      <TextFieldInput
                        required
                        placeholder="10"
                        type="number"
                        min={0}
                        max={balance?.toString() || "0"}
                      />
                    </Form.Control>
                    <Text size="2" weight="bold" style={{ paddingInline: "0.5rem" }}>
                      ${balance.toString().slice(0, 4)} available
                    </Text>
                  </Flex>
                </Flex>
              </Form.Field>
            </Flex>
            {error && (
              <Text size="2" weight="bold" style={{ color: "var(--accent-9)" }}>
                {error}
              </Text>
            )}
          </Flex>

          <Button type="submit">Send</Button>
        </Form.Root>
      )}

      {isLoading && (
        <Flex direction="column" justify="center" align="center" grow="1" gap="5">
          <Spinner />
          <Text size="2" weight="bold">
            Sending transaction...
          </Text>
        </Flex>
      )}

      {txReceipt && !isLoading && (
        <>
          <Flex direction="column" justify="center" align="center" grow="1" gap="5">
            {txReceipt.success ? (
              <>
                <CheckCircledIcon height="50" width="100%" color="var(--teal-11)" />
                <Link
                  href={`https://goerli.basescan.org/tx/${txReceipt.receipt.transactionHash}`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Flex direction="row" gap="2" style={{ color: "var(--teal-11)" }}>
                    See transaction
                    <ExternalLinkIcon style={{ alignSelf: "center", color: "var(--teal-11)" }} />
                  </Flex>
                </Link>
              </>
            ) : (
              <>
                <CrossCircledIcon height="50" width="100%" color="var(--red-9)" />
                <Link
                  href={`https://goerli.basescan.org/tx/${txReceipt.receipt.transactionHash}`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Flex direction="row" gap="2" style={{ color: "var(--red-9)" }}>
                    Transaction failed!
                    <ExternalLinkIcon style={{ alignSelf: "center", color: "var(--red-9)" }} />
                  </Flex>
                </Link>
              </>
            )}
          </Flex>
        </>
      )}
    </Flex>
  );
}

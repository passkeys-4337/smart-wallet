"use client";

import { Chain, EstimateFeesPerGasReturnType, Hash, Hex, parseEther } from "viem";
import { smartWallet } from "@/libs/smart-wallet";
import { useEffect, useRef, useState } from "react";
import { Flex, Link, Button, Heading, Text, TextField, Callout } from "@radix-ui/themes";
import { UserOpBuilder, emptyHex } from "@/libs/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useMe } from "@/providers/MeProvider";
import Spinner from "../Spinner";
import { MAINNET_PUBLIC_CLIENT } from "@/constants";
import { normalize } from "viem/ens";

smartWallet.init();
const builder = new UserOpBuilder(smartWallet.client.chain as Chain);

export default function SendTxModal() {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [userInputDestination, setUserInputDestination] = useState("");
  const [userInputAmount, setUserInputAmount] = useState("");
  const [isBelowBalance, setIsBelowBalance] = useState(false);
  const [ensIsLoading, setEnsIsLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const { me } = useMe();
  const { balance, refreshBalance } = useBalance();

  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = addressInputRef.current as HTMLInputElement;
    if (!input) return;
    if (userInputDestination.endsWith(".eth") && !destination) {
      input.setCustomValidity("We didn't find any address associated with this ENS name");
      return;
    }
    input.setCustomValidity("");
  }, [userInputDestination, destination]);

  function handleUserInputDestination(e: any) {
    const value = e.target.value;
    setDestination("");
    setUserInputDestination(value);
    resolveUserInputDestination(value);
  }

  function handleUserInputAmount(e: any) {
    const value = e.target.value;
    const amount = Number(value);
    if ((amount > Number(balance) && value !== "") || value === "") {
      setIsBelowBalance(false);
    }
    if (amount <= Number(balance) && value !== "") {
      setIsBelowBalance(true);
    }
    setUserInputAmount(value);
  }

  async function resolveUserInputDestination(value: string) {
    if (!value) {
      setDestination("");
      return;
    }

    if (value.match(/^0x[a-fA-F0-9]{40}$/)) {
      setDestination(value);
      try {
        setEnsIsLoading(true);
        const name = await MAINNET_PUBLIC_CLIENT.getEnsName({
          address: normalize(value) as Hash,
        });
        if (name) {
          setUserInputDestination(name);
        }
      } finally {
        setEnsIsLoading(false);
        return;
      }
    }

    if (value.endsWith(".eth")) {
      setEnsIsLoading(true);
      try {
        const address = await MAINNET_PUBLIC_CLIENT.getEnsAddress({
          name: normalize(value),
        });
        address ? setDestination(address) : setDestination("");
      } finally {
        setEnsIsLoading(false);
        return;
      }
    }
    setDestination("");
  }

  const submitTx = async (e: any) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();

    try {
      const price: { ethereum: { usd: number } } = await (
        await fetch("/api/price?ids=ethereum&currencies=usd")
      ).json();
      const { maxFeePerGas, maxPriorityFeePerGas }: EstimateFeesPerGasReturnType =
        await smartWallet.client.estimateFeesPerGas();

      const userOp = await builder.buildUserOp({
        calls: [
          {
            dest: destination.toLowerCase() as Hex,
            value:
              BigInt(parseEther(userInputAmount)) /
              (BigInt(Math.trunc(price.ethereum.usd * 100)) / BigInt(100)), // 100 is the price precision
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
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
      refreshBalance();
    }
  };

  if (isLoading)
    return (
      <Flex direction="column" justify="center" align="center" grow="1" gap="5">
        <Spinner style={{ margin: 0 }} />
        <Text size="2">Sending transaction...</Text>
      </Flex>
    );

  if (txReceipt && !isLoading)
    return (
      <>
        <Flex direction="column" justify="center" align="center" grow="1" gap="5">
          {true ? (
            <>
              <CheckCircledIcon height="32" width="100%" color="var(--teal-11)" />
              <Link
                href={`https://sepolia.etherscan.io/tx/${txReceipt?.receipt?.transactionHash}`}
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <Flex direction="row" gap="2">
                  <Text size="2">See transaction</Text>
                  <ExternalLinkIcon style={{ alignSelf: "center", color: "var(--teal-11)" }} />
                </Flex>
              </Link>
            </>
          ) : (
            <>
              <CrossCircledIcon height="32" width="100%" />
              <Link
                href={`https://sepolia.etherscan.io/tx/${txReceipt?.receipt?.transactionHash}`}
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <Flex direction="row" gap="2" style={{ color: "var(--gray-12)" }}>
                  <Text size="2">Transaction reverted</Text>
                  <ExternalLinkIcon style={{ alignSelf: "center" }} />
                </Flex>
              </Link>
            </>
          )}
        </Flex>
      </>
    );

  return (
    <Flex direction="column" style={{ flexGrow: 1, width: "100%" }} gap="5">
      {!txReceipt && !isLoading && (
        <Heading as="h2" size={"8"} style={{ color: "var(--accent-9)" }}>
          Send transaction
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
          }}
          onSubmit={async (e) => await submitTx(e)}
        >
          <Flex direction="column">
            <Flex direction="column">
              <div
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Flex direction="column" gap="1">
                  <Flex direction="row" justify="between" gap="2"></Flex>

                  <TextField.Root>
                    <TextField.Slot style={{ color: "var(--accent-11)", paddingLeft: "1rem" }}>
                      To:
                    </TextField.Slot>
                    <TextField.Input
                      ref={addressInputRef}
                      required
                      pattern="0x[a-fA-F0-9]{40}|[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.eth"
                      title="an ethereum address or a valid ENS name"
                      placeholder="ENS or address"
                      size={"3"}
                      value={userInputDestination}
                      onChange={handleUserInputDestination}
                    />
                    <TextField.Slot style={{ color: "var(--accent-11)" }}>
                      {!destination && ensIsLoading && (
                        <Spinner style={{ margin: 0, width: 20, height: 20 }} />
                      )}
                      {destination && (
                        <CheckCircledIcon height="20" width="20" color="var(--accent-11)" />
                      )}
                      {!destination && !ensIsLoading && (
                        <CrossCircledIcon
                          height="20"
                          width="20"
                          color="var(--teal-11)"
                          style={{ visibility: "hidden" }}
                        />
                      )}
                    </TextField.Slot>
                  </TextField.Root>
                </Flex>
              </div>
              <div>
                <Flex direction="column" gap="1">
                  <Flex direction="column" gap="2">
                    <TextField.Root>
                      <TextField.Slot style={{ color: "var(--accent-11)", paddingLeft: "1rem" }}>
                        USD:
                      </TextField.Slot>
                      <TextField.Input
                        required
                        placeholder="0.00"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={balance?.toString() || 0}
                        size={"3"}
                        step={0.01}
                        value={userInputAmount}
                        onChange={handleUserInputAmount}
                      />
                      <TextField.Slot style={{ color: "var(--accent-11)" }}>
                        {isBelowBalance && (
                          <CheckCircledIcon height="20" width="20" color="var(--accent-11)" />
                        )}
                        {!isBelowBalance && (
                          <CrossCircledIcon
                            height="20"
                            width="20"
                            color="var(--teal-11)"
                            style={{ visibility: "hidden" }}
                          />
                        )}
                      </TextField.Slot>
                    </TextField.Root>

                    <Text
                      size="2"
                      style={{ paddingInline: "0.5rem", alignSelf: "flex-end" }}
                      color="gray"
                    >
                      ${balance.toString().slice(0, 4)} available
                    </Text>
                  </Flex>
                </Flex>
              </div>
            </Flex>
          </Flex>

          <Flex direction={"column"} gap="3">
            {error && (
              <Callout.Root
                style={{ maxHeight: "150px", overflowY: "scroll", wordBreak: "break-word" }}
              >
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}
            <Button variant="outline" size="3" type="submit">
              SEND
            </Button>
          </Flex>
        </form>
      )}
    </Flex>
  );
}

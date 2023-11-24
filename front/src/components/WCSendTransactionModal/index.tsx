import { Text, TextField, Button, Flex, Link, Callout, Heading, TextArea } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import Spinner from "../Spinner";
import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { smartWallet } from "@/libs/smart-wallet";
import { Chain, Hash, formatEther } from "viem";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";
import { EthSendTransactionParams } from "@/libs/wallet-connect/config/EIP155";
import { MAINNET_PUBLIC_CLIENT } from "@/constants";
import { normalize } from "viem/ens";

type Props = {
  params: EthSendTransactionParams;
  origin: string;
  onSuccess: (hash: Hash) => void;
};

export default function WCSendTransactionModal({ params, origin, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [destination, setDestination] = useState<string>("");
  const [ensIsLoading, setEnsIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { me } = useMe();
  const { refreshBalance } = useBalance();

  useEffect(() => {
    if (!params?.to) return;

    async function resolveUserInputDestination(value: string) {
      if (!value) {
        setDestination("");
        return;
      }

      if (value.match(/^0x[a-fA-F0-9]{40}$/)) {
        setEnsIsLoading(true);
        const minifiedAddress = value.slice(0, 6) + "..." + value.slice(-4);
        setDestination(minifiedAddress);
        try {
          const name = await MAINNET_PUBLIC_CLIENT.getEnsName({
            address: normalize(value) as Hash,
          });
          if (name) {
            setDestination(name);
          }
        } finally {
          setEnsIsLoading(false);
          return;
        }
      }
    }

    resolveUserInputDestination(params?.to);
  }, [params?.to]);

  const submitTx = async (e: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!me?.keyId) throw new Error("No user found");
      const builder = new UserOpBuilder(smartWallet.client.chain as Chain);
      const { maxFeePerGas, maxPriorityFeePerGas } = await smartWallet.client.estimateFeesPerGas();

      const value = params?.value ? BigInt(params.value) : BigInt(0);

      const userOp = await builder.buildUserOp({
        calls: [
          {
            dest: params.to,
            value,
            data: params.data,
          },
        ],
        maxFeePerGas: maxFeePerGas as bigint,
        maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
        keyId: me.keyId,
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      setTxReceipt(receipt);
      onSuccess(receipt?.receipt?.transactionHash);
    } catch (e: any) {
      console.error(e);
      setError(e);
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
          {origin}
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
                    <TextField.Input disabled size={"3"} value={destination} />
                    <TextField.Slot style={{ color: "var(--accent-11)" }}>
                      {!destination && ensIsLoading && (
                        <Spinner style={{ margin: 0, width: 20, height: 20 }} />
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

              <Flex direction="column" gap="3">
                <Flex direction="column" gap="2">
                  <TextField.Root>
                    <TextField.Slot style={{ color: "var(--accent-11)", paddingLeft: "1rem" }}>
                      ETH:
                    </TextField.Slot>
                    <TextField.Input
                      disabled
                      value={formatEther(BigInt(params?.value || 0)).toString()}
                      size={"3"}
                    />
                    <TextField.Slot style={{ color: "var(--accent-11)" }}></TextField.Slot>
                  </TextField.Root>
                </Flex>
                <div>
                  <Text style={{ color: "var(--accent-10)", marginLeft: "1rem" }}>Data:</Text>
                  <TextArea
                    disabled
                    style={{
                      resize: "none",
                      minHeight: "100px",
                      borderRadius: "20px",
                      padding: ".5rem",
                    }}
                    value={params.data}
                  />
                </div>
              </Flex>
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

import {
  Text,
  TextField,
  Button,
  Flex,
  Card,
  Link,
  Callout,
  Heading,
  TextArea,
} from "@radix-ui/themes";
import { useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import Spinner from "../Spinner";
import { UserOpBuilder } from "@/libs/smart-wallet/service/userOps";
import { smartWallet } from "@/libs/smart-wallet";
import { Chain, formatEther } from "viem";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";
import { EthSendTransactionParams } from "@/libs/wallet-connect/config/EIP155";

type Props = {
  params: EthSendTransactionParams;
};

export default function WCSendTransactionModal({ params }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [error, setError] = useState<Error | null>(null);
  const { refreshBalance } = useBalance();
  const { me } = useMe();

  const submitTx = async (e: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!me?.keyId) throw new Error("No user found");
      const builder = new UserOpBuilder(smartWallet.client.chain as Chain);
      const { maxFeePerGas, maxPriorityFeePerGas } = await smartWallet.client.estimateFeesPerGas();

      const value = params?.value ? BigInt(params.value) : BigInt(0);
      const callGasLimit = params?.gas ? BigInt(params.gas) : undefined;

      const userOp = await builder.buildUserOp({
        calls: [
          {
            dest: params.to,
            value,
            data: params.data,
          },
        ],
        callGasLimit,
        maxFeePerGas: maxFeePerGas as bigint,
        maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
        keyId: me.keyId,
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      setTxReceipt(receipt);
      // to do have the typing of receipt
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setIsLoading(false);
      refreshBalance();
    }
  };

  if (isLoading) {
    return (
      <Flex direction="column" width="100%" style={{ flexGrow: 1 }} justify={"center"}>
        <Spinner />
      </Flex>
    );
  }

  if (success && txReceipt) {
    return (
      <Flex
        direction="column"
        width="100%"
        style={{ flexGrow: 1 }}
        justify={"center"}
        align={"center"}
        gap={"3"}
      >
        <Link
          href={`https://goerli.basescan.org/tx/${txReceipt?.receipt?.transactionHash}`}
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          <Flex direction="row" gap="2">
            <Text size={"5"}>See transaction</Text>
            <ExternalLinkIcon style={{ alignSelf: "center" }} />
          </Flex>
        </Link>
        <CheckCircledIcon height="40" width="40" color="var(--accent-11)" />
      </Flex>
    );
  }

  if (txReceipt && !success) {
    return (
      <Flex
        direction="column"
        width="100%"
        style={{ flexGrow: 1 }}
        justify={"center"}
        align={"center"}
        gap={"3"}
      >
        <Link
          href={`https://goerli.basescan.org/tx/${txReceipt?.receipt?.transactionHash}`}
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          <Flex direction="row" gap="2">
            <Text size={"5"}>See failed transaction</Text>
            <ExternalLinkIcon style={{ alignSelf: "center" }} />
          </Flex>
        </Link>
        <CrossCircledIcon height="40" width="40" color="var(--accent-11)" />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      width="100%"
      justify={"between"}
      align={"center"}
      gap={"3"}
      grow={"1"}
      style={{ overflow: "scroll" }}
    >
      <Flex direction={"column"} gap={"5"} style={{ width: "100%" }}>
        <Heading as={"h2"}>Send Transaction</Heading>

        <Flex direction={"column"} gap={"3"}>
          <TextField.Root variant="surface">
            <TextField.Slot>
              <Text>To:</Text>
            </TextField.Slot>
            <TextField.Input disabled value={params?.to} />
          </TextField.Root>
          <TextField.Root variant="surface">
            <TextField.Slot>
              <Text>Amount:</Text>
            </TextField.Slot>
            <TextField.Input disabled value={params?.value} />
            <TextField.Slot>
              <Text>ETH</Text>
            </TextField.Slot>
          </TextField.Root>
          <TextArea disabled variant={"surface"} content={params?.data} />
        </Flex>
      </Flex>

      <Button onClick={submitTx} size={"3"} variant="outline" style={{ width: "100%" }}>
        SEND
      </Button>
      {error && (
        <Callout.Root color="red" role="alert" style={{ width: "100%" }}>
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text style={{ wordBreak: "break-all" }}>
            {(error as Error)?.message ?? "An error occurred, please try again later."}
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}

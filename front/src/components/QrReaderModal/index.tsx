import ReactQrReader from "react-qr-reader-es6";
import { Text, TextField, Button, Flex, Card, Link, Callout } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { IWCReactSession, useWalletConnect } from "@/libs/wallet-connect";
import Spinner from "../Spinner";
import { useModal } from "@/providers/ModalProvider";
import { truncate } from "@/utils/truncate";

export default function QrReaderModal() {
  const [input, setInput] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pairingTopic, setPairingTopic] = useState<string | null>("");
  const [wcReactSession, setWcReactSession] = useState<IWCReactSession | null>(null);
  const { pairSession, pairingStates, sessions } = useWalletConnect();
  const { close } = useModal();

  function handlePair(data: string | null) {
    if (data?.startsWith("wc:")) {
      setIsLoading(true);
      pairSession({
        uri: data,
        onStart: (pairingTopic) => {
          setPairingTopic(pairingTopic);
        },
        onSuccess: (pairingTopic) => {},
        onError: (error) => {
          setPairingTopic(null);
          setIsLoading(false);
          setSuccess(false);
          setError(error);
        },
      });
    } else {
      if (!data) {
        setError({ message: "Please add a valid Wallet Connect code " } as Error);
      }
      setError({ message: "Invalid Wallet Connect QR code" } as Error);
    }
  }

  function handleScan(data: string | null) {
    if (data) {
      handlePair(data);
      if (data.startsWith("0x")) {
        console.log("TODO: handle ethereum address");
      }
    }
  }

  useEffect(() => {
    if (!pairingTopic) return;
    const pairingState = pairingStates[pairingTopic];

    setIsLoading(pairingState?.isLoading || false);

    const session = Object.values(sessions)?.find(
      (el: IWCReactSession) => el?.session?.pairingTopic === pairingTopic,
    );
    if (session) {
      setWcReactSession(session);
      setSuccess(true);
    }
  }, [sessions, pairingTopic, pairingStates, close]);

  if (success && wcReactSession) {
    const { name, icons, url } = wcReactSession.session.peer.metadata;
    return (
      <Flex
        direction="column"
        width="100%"
        style={{ flexGrow: 1 }}
        justify={"center"}
        align={"center"}
        gap={"9"}
      >
        <Card style={{ width: "100%", height: "100%" }}>
          <Flex style={{ height: "100%" }} align={"center"}>
            <Flex
              gap="5"
              width={"100%"}
              direction={"column"}
              justify={"between"}
              align={"center"}
              style={{ padding: "2rem" }}
            >
              <img src={icons[0]} alt="test" width={100} style={{ borderRadius: "10px" }} />
              <Flex direction={"column"} align={"center"}>
                <Text align={"center"} size={"5"}>
                  {name}
                </Text>
                <Link href={url}>{truncate(url?.split("https://")[1] ?? "Unknown", 23)}</Link>
              </Flex>
              <CheckCircledIcon height="40" width="40" color="var(--accent-11)" />
            </Flex>
          </Flex>
        </Card>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex direction="column" width="100%" style={{ flexGrow: 1 }} justify={"center"}>
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      width="100%"
      align={"center"}
      gap={"3"}
      grow={"1"}
      style={{ overflow: "scroll" }}
    >
      <ReactQrReader
        style={{
          borderRadius: " 10px",
          width: "100%",
          overflow: "hidden",
          background: "var(--gray-5)",
        }}
        showViewFinder={false}
        onError={(err) => console.error(err)}
        onScan={handleScan}
      />

      <Flex gap="2" style={{ width: "100%" }}>
        <TextField.Root size={"3"} style={{ width: "100%", paddingRight: "1rem" }}>
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
          <TextField.Input
            placeholder="wc:…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </TextField.Root>
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            handlePair(input);
          }}
          size={"3"}
        >
          {isLoading ? "is connecting" : "Connect"}
        </Button>
      </Flex>

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

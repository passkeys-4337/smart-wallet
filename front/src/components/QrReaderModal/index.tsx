import ReactQrReader from "react-qr-reader-es6";
import { Text, TextField, Button, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { CheckCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useWalletConnect } from "@/libs/wallet-connect";
import Spinner from "../Spinner";
import { useModal } from "@/providers/ModalProvider";

export default function QrReaderModal() {
  const [input, setInput] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const { close } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pairingTopic, setPairingTopic] = useState<string | null>("");

  const { pairSession, pairingState, sessions } = useWalletConnect();
  function handleScan(data: string | null) {
    if (data) {
      if (data.startsWith("wc:")) {
        setIsLoading(true);
        pairSession({
          uri: data,
          onSuccess: (pairingTopic) => {
            // setSuccess(true);
            setPairingTopic(pairingTopic);
            setTimeout(() => {
              close();
            }, 3000);
          },
          onError: () => {},
        });
      }
      if (data.startsWith("0x")) {
        console.log("TODO: handle ethereum address");
      }
    }
  }

  // useEffect(() => {}, [pairingState]);

  // const isLoading = Object.values(pairingState).some((element) => element.isLoading);

  if (success) {
    return (
      <Flex
        direction="column"
        width="100%"
        style={{ flexGrow: 1 }}
        justify={"center"}
        align={"center"}
      >
        <CheckCircledIcon height="40" width="40" color="var(--accent-11)" />
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
    <Flex direction="column" width="100%" align={"center"} gap={"3"}>
      <ReactQrReader
        style={{
          borderRadius: " 10px",
          width: "90%",
          overflow: "hidden",
          background: "var(--gray-5)",
        }}
        showViewFinder={false}
        onError={(err) => console.error(err)}
        onScan={handleScan}
      />
      <Text>or</Text>

      <Flex gap="2">
        <TextField.Root size={"3"}>
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
            if (input.startsWith("wc:")) {
              pairSession({
                uri: input,
                onSuccess: (pairingTopic) => {
                  setSuccess(true);
                  setTimeout(() => {
                    close();
                  }, 3000);
                },
                onError: () => {},
              });
            }
          }}
          size={"3"}
        >
          {isLoading ? "is connecting" : "Connect"}
        </Button>
      </Flex>
    </Flex>
  );
}

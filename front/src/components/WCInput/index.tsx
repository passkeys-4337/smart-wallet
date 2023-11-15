"use client";

import { useState } from "react";
import { Flex, TextField, Button } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useWalletConnect } from "@/libs/wallet-connect";

export default function WCInput() {
  const [input, setInput] = useState<string>("");

  const { pairSession, pairingState } = useWalletConnect();

  const isLoading = Object.values(pairingState).some((element) => element.isLoading);

  return (
    <Flex gap="2">
      <TextField.Root>
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Input
          placeholder="wc:…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </TextField.Root>
      <Button onClick={() => pairSession(input)}>{isLoading ? "is connecting" : "Connect"}</Button>
    </Flex>
  );
}

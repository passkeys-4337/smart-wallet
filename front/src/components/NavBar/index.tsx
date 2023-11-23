"use client";

import { Button, Flex } from "@radix-ui/themes";
import { useModal } from "@/providers/ModalProvider";
import { PaperPlaneIcon, CornersIcon } from "@radix-ui/react-icons";
import { SendTransaction } from "@/components/SendTransaction";
import { useEffect } from "react";
import QrReaderModal from "../QrReaderModal";

export default function NavBar() {
  const { open } = useModal();

  return (
    <Flex justify="center" direction="column" gap="4" style={{ marginInline: "2 rem" }}>
      <Button
        size="3"
        variant="outline"
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => open(<SendTransaction />)}
      >
        {" "}
        Send a transaction
        <PaperPlaneIcon />
      </Button>
      <Button
        size="3"
        variant="outline"
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => open(<QrReaderModal />)}
      >
        Connect a dApp
        <CornersIcon style={{ width: 20, height: 20 }} />
      </Button>
    </Flex>
  );
}

"use client";

import { Button, Flex } from "@radix-ui/themes";
import { useModal } from "@/providers/ModalProvider";
import { PaperPlaneIcon, CornersIcon } from "@radix-ui/react-icons";
import { SendTransaction } from "@/components/SendTransaction";
import { useEffect } from "react";

export default function NavBar() {
  const { open } = useModal();

  return (
    <Flex justify="center" direction="row" gap="5" style={{ marginInline: "2 rem" }}>
      <Button
        size="4"
        variant="outline"
        style={{ flexGrow: 1 }}
        onClick={() => open(<SendTransaction />)}
      >
        <PaperPlaneIcon />
      </Button>
      <Button size="4" variant="outline" style={{ flexGrow: 1 }}>
        <CornersIcon style={{ width: 20, height: 20 }} />
      </Button>
    </Flex>
  );
}

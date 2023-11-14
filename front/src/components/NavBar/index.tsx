"use client";

import { Button, Flex } from "@radix-ui/themes";
import sendSVG from "./send.svg";
import photoSVG from "./photo.svg";
import Image from "next/image";
import Modal1 from "@/components/Modal1";
import { useModal } from "@/providers/ModalProvider";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

export default function NavBar() {
  const { open } = useModal();

  return (
    <Flex justify="center" direction="row" gap="5" style={{ marginInline: "2 rem" }}>
      <Button
        size="3"
        variant="outline"
        color="green"
        radius="full"
        style={{ flexGrow: 1 }}
        onClick={() => open(<Modal1 />)}
      >
        <PaperPlaneIcon />
      </Button>
      <Button size="3" variant="outline" color="indigo" radius="full" style={{ flexGrow: 1 }}>
        <Image src={photoSVG} alt="Photo" />
      </Button>
    </Flex>
  );
}

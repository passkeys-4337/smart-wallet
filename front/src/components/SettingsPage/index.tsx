"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Button, Flex, Heading, IconButton, Tooltip, Separator } from "@radix-ui/themes";
import { Text } from "@radix-ui/themes";
import { ArrowLeftIcon, AvatarIcon } from "@radix-ui/react-icons";
import ThemeButton from "../ThemeButton";
import Link from "next/link";
import { useWalletConnect } from "@/libs/wallet-connect";
import SessionCard from "../SessionCard";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { me, disconnect, isMounted } = useMe();
  const { sessions } = useWalletConnect();
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  if (!isMounted) return null;

  if (me) {
    return (
      <Flex direction="column" width="100%" align={"start"} gap={"6"}>
        <Flex justify={"between"} width={"100%"}>
          <ThemeButton />

          <Link href={"/"}>
            <IconButton variant="soft" size={"3"}>
              <ArrowLeftIcon />
            </IconButton>
          </Link>
        </Flex>
        <Heading as="h1" style={{ textAlign: "center" }} size={"8"}>
          Settings
        </Heading>
        <Flex direction="column" width={"100%"} align={"start"} gap={"2"}>
          <Text>On Sepolia testnet only:</Text>
          <Flex style={{ width: "100%" }} align={"center"} gap="2" justify={"between"}>
            <Tooltip content="Copied!" open={isCopied}>
              <Button
                size={"3"}
                variant="soft"
                onClick={() => {
                  navigator.clipboard.writeText(me?.account || "");
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 1000);
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <AvatarIcon />
                {me?.account.slice(0, 8)}...{me?.account.slice(-6)}
              </Button>
            </Tooltip>
            <Button
              size={"3"}
              onClick={() => {
                disconnect();
                router.push("/");
              }}
              style={{ width: "110px" }}
              color={"red"}
              variant="outline"
            >
              LOG OUT
            </Button>
          </Flex>
        </Flex>

        <Separator style={{ width: "100%" }} />

        <Flex direction="column" width={"100%"} align={"start"} gap={"2"}>
          <Heading as="h2" style={{ marginBottom: ".5rem" }}>
            Wallet Connect
          </Heading>

          {(!sessions || Object.values(sessions).length < 1) && (
            <Text>No active dApp sessions</Text>
          )}
          {sessions &&
            Object.values(sessions).length > 0 &&
            Object.values(sessions).map((element) => {
              return <SessionCard key={element.session.topic} wcReactSession={element} />;
            })}
        </Flex>
      </Flex>
    );
  } else {
    return <OnBoarding />;
  }
}

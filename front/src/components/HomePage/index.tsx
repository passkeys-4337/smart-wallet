"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Button, Flex } from "@radix-ui/themes";
import Balance from "../Balance";
import NavBar from "../NavBar";
import History from "../History";
import TopBar from "../TopBar";

export default function Home() {
  const { me, disconnect, isMounted } = useMe();

  if (!isMounted) return null;

  if (me) {
    return (
      <Flex direction="column" width="100%">
        <TopBar />
        <Balance />
        <NavBar />
        <History />
        <Button onClick={disconnect}>Logout</Button>
      </Flex>
    );
  } else {
    return <OnBoarding />;
  }
}

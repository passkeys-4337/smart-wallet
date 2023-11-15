"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Button, Flex } from "@radix-ui/themes";
import Balance from "../Balance";
import NavBar from "../NavBar";
import History from "../History";
import { Text } from "@radix-ui/themes";
import Address from "@/components/Address";

export default function Home() {
  const { me, disconnect } = useMe();

  if (me) {
    return (
      <Flex direction="column" width="100%" style={{ padding: "1rem 0" }}>
        <Address style={{ alignSelf: "center" }} />
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

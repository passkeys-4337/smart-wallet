"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Flex } from "@radix-ui/themes";
import Balance from "../Balance";
import NavBar from "../NavBar";
import History from "../History";
import TopBar from "../TopBar";

export default function Home() {
  const { me, isMounted } = useMe();

  if (!isMounted) return null;

  if (me) {
    return (
      <Flex direction="column" width="100%">
        <TopBar />
        <Balance />
        <NavBar />
        <History />
      </Flex>
    );
  } else {
    return <OnBoarding />;
  }
}

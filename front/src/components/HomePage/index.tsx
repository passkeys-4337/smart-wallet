"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Button } from "@radix-ui/themes";
import Balance from "../Balance";
import NavBar from "../NavBar";
import History from "../History";
import { Text } from "@radix-ui/themes";

export default function Home() {
  const { me, disconnect } = useMe();

  if (me) {
    return (
      <div style={{ width: "100%" }}>
        {me?.account && (
          <Text>
            {me.account.slice(0, 6)}...{me.account.slice(-4)}
          </Text>
        )}
        <Balance />
        <NavBar />
        <History />
        <Button onClick={disconnect}>Logout</Button>
      </div>
    );
  } else {
    return <OnBoarding />;
  }
}

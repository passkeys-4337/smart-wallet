"use client";

import OnBoarding from "@/components/OnBoarding";
import { useMe } from "@/providers/MeProvider";
import { Button, Flex, Heading, Kbd, Link } from "@radix-ui/themes";
import Balance from "../Balance";
import NavBar from "../NavBar";
import History from "../History";
import { Text } from "@radix-ui/themes";
import Address from "@/components/Address";
import styled from "@emotion/styled";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const Container = styled(Flex)`
  position: relative;
  width: 100%;
  gap: 2rem;
  background-color: "red";
`;

const Hero = styled(Flex)`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled(Heading)`
  text-align: center;
`;

export default function Home() {
  const { me, disconnect, isMounted } = useMe();

  if (!isMounted) return null;

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

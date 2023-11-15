import { useMe } from "@/providers/MeProvider";
import { GitHubLogoIcon, ReloadIcon, SunIcon, MoonIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  Heading,
  Link,
  TextField,
  Blockquote,
  Text,
  Kbd,
  Switch,
} from "@radix-ui/themes";
import { CSSProperties, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "next-themes";
import ThemeButton from "../ThemeButton";

const css: CSSProperties = {
  flexGrow: 1,
  gap: "1rem",
};

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

export default function OnBoarding() {
  const [username, setUsername] = useState("");
  const { create, get, returning, isLoading } = useMe();

  const [createForm, setCreateForm] = useState(!returning);

  if (!createForm) {
    return (
      <Container align="center" justify={"between"} direction="column">
        <ThemeButton
          style={{
            position: "absolute",
            top: "0rem",
            right: "0rem",
          }}
        />
        <Hero>
          <Title as="h1" size={"8"}>
            Smart Wallet
          </Title>
          <Link href="https://github.com/passkeys-4337/smart-wallet">
            <Kbd size={"6"}>
              <GitHubLogoIcon style={{ marginRight: ".5rem" }} />
              passkeys-4337
            </Kbd>
          </Link>
        </Hero>

        {isLoading && <ReloadIcon className="spinner" />}
        {!isLoading && (
          <Button style={{ width: "200px" }} variant={"outline"} size={"3"} onClick={() => get()}>
            SIGN IN
          </Button>
        )}
        <Link onClick={() => !isLoading && setCreateForm(true)} size={"2"}>
          or create a new account
        </Link>
      </Container>
    );
  }

  return (
    <Container align="center" justify={"between"} direction="column">
      <ThemeButton
        style={{
          position: "absolute",
          top: "0rem",
          right: "0rem",
        }}
      />
      <Hero>
        <Title as="h1" size={"8"}>
          Smart Wallet
        </Title>
        <Link href="https://github.com/passkeys-4337/smart-wallet">
          <Kbd size={"6"}>
            <GitHubLogoIcon style={{ marginRight: ".5rem" }} />
            passkeys-4337
          </Kbd>
        </Link>
      </Hero>

      <form
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          username && create(username);
        }}
      >
        <TextField.Input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Name"
          disabled={isLoading}
          size={"3"}
          style={{ width: "200px", padding: "0.5rem" }}
        />
        {!isLoading && (
          <Button style={{ width: "200px" }} variant={"outline"} size={"3"} type={"submit"}>
            NEW ACCOUNT
          </Button>
        )}
        {isLoading && <ReloadIcon className="spinner" />}
      </form>
      {!isLoading && (
        <Link onClick={() => setCreateForm(false)} size={"2"}>
          or sign in to an existing account
        </Link>
      )}
    </Container>
  );
}

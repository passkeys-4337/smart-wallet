import { useMe } from "@/providers/MeProvider";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, TextField, IconButton, Text } from "@radix-ui/themes";
import { useState } from "react";
import ThemeButton from "../ThemeButton";
import LogoAnimated from "../LogoAnimated";
import Spinner from "../Spinner";
import BaseLogo from "../BaseLogo";

export default function OnBoarding() {
  const [username, setUsername] = useState("");
  const { create, get, returning, isLoading } = useMe();
  const [createForm, setCreateForm] = useState(!returning);

  return (
    <Flex
      align="center"
      justify={"between"}
      direction="column"
      style={{ position: "relative", width: "100%", gap: "2rem" }}
    >
      <Flex justify={"between"} align={"baseline"} width={"100%"}>
        <IconButton
          onClick={() => window.open("https://github.com/passkeys-4337/smart-wallet", "_blank")}
          variant="soft"
          size={"3"}
        >
          <GitHubLogoIcon />
        </IconButton>

        <ThemeButton />
      </Flex>

      {isLoading && <Spinner />}

      {!isLoading && (
        <form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
          onSubmit={(e) => {
            if (createForm) {
              e.preventDefault();
              username && create(username);
            }

            if (!createForm) {
              e.preventDefault();
              get();
            }
          }}
        >
          <LogoAnimated
            style={{
              width: "240px",
            }}
          />
          {createForm && (
            <Flex gap={"2"} style={{ width: "250px" }}>
              <TextField.Input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Wallet name"
                disabled={isLoading}
                size={"3"}
                style={{
                  padding: "0.5rem",
                }}
              />

              <Button
                style={{ width: "110px", textAlign: "center" }}
                variant={"outline"}
                size={"3"}
                type={"submit"}
              >
                CREATE
              </Button>
            </Flex>
          )}
          {!createForm && (
            <Button style={{ width: "250px" }} variant={"outline"} size={"3"} type={"submit"}>
              LOG IN
            </Button>
          )}
        </form>
      )}

      <Flex style={{ width: "100%", whiteSpace: "nowrap" }} justify={"end"}>
        {!createForm && !isLoading && (
          <Link
            onClick={() => {
              !isLoading && setCreateForm(true);
            }}
            size={"2"}
          >
            or create a new wallet
          </Link>
        )}

        {createForm && !isLoading && (
          <Link onClick={() => !isLoading && setCreateForm(false)} size={"2"}>
            or log in with an existing passkey
          </Link>
        )}
      </Flex>
    </Flex>
  );
}

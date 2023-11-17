import { useMe } from "@/providers/MeProvider";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, TextField, IconButton } from "@radix-ui/themes";
import { useState } from "react";
import ThemeButton from "../ThemeButton";
import LogoAnimated from "../LogoAnimated";
import Spinner from "../Spinner";

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
      <ThemeButton
        style={{
          position: "absolute",
          top: "0rem",
          right: "0rem",
        }}
      />
      <IconButton
        style={{ position: "absolute", top: "0rem", left: "0rem" }}
        onClick={() => window.open("https://github.com/passkeys-4337/smart-wallet", "_blank")}
        variant="soft"
      >
        <GitHubLogoIcon />
      </IconButton>
      <LogoAnimated
        style={{
          transform: "translateY(3rem)",
          width: "240px",
        }}
      />

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
          {createForm && (
            <TextField.Input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Name"
              disabled={isLoading}
              size={"3"}
              style={{
                width: "250px",
                padding: "0.5rem",
              }}
            />
          )}
          <Button style={{ width: "250px" }} variant={"outline"} size={"3"} type={"submit"}>
            {createForm ? "CREATE ACCOUNT" : "SIGN IN"}
          </Button>
        </form>
      )}

      {!createForm && (
        <Link onClick={() => !isLoading && setCreateForm(true)} size={"2"}>
          or create a new account
        </Link>
      )}

      {createForm && (
        <Link onClick={() => !isLoading && setCreateForm(false)} size={"2"}>
          or sign in with an existing account
        </Link>
      )}
    </Flex>
  );
}

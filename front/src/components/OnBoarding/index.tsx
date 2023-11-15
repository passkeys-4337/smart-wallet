import { WebAuthn } from "@/libs/web-authn/service/web-authn";
import { useMe } from "@/providers/MeProvider";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, TextField } from "@radix-ui/themes";
import { CSSProperties, useEffect, useState } from "react";

const css: CSSProperties = {
  flexGrow: 1,
  gap: "1rem",
};

const cssBtn: CSSProperties = {
  // opacity: 0,
  cursor: "pointer",
  width: "100%",
  // height: "100%",
  // background: "transparent",
  // outline: "none",
  // border: "none",
  //position: "absolute",
};

export default function OnBoarding() {
  const [username, setUsername] = useState("");
  const { create, get, returning, isLoading } = useMe();

  const [createForm, setCreateForm] = useState(!returning);

  if (!createForm) {
    return (
      <Flex style={css} align="center" justify="center" direction="column">
        {isLoading && <ReloadIcon className="spinner" />}
        {!isLoading && <Button onClick={() => get()}> Sign In</Button>}
        {!isLoading && <Link onClick={() => setCreateForm(true)}>or create a new account</Link>}
      </Flex>
    );
  }

  return (
    <Flex style={css} align="center" justify="center" direction="column">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          username && create(username);
        }}
      >
        <TextField.Input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="account name"
          disabled={isLoading}
        />
        {!isLoading && <Button type={"submit"}>CREATE</Button>}
        {isLoading && <ReloadIcon className="spinner" />}
      </form>
      {!isLoading && (
        <Link onClick={() => setCreateForm(false)}>or sign in to an existing account</Link>
      )}
    </Flex>
  );
}

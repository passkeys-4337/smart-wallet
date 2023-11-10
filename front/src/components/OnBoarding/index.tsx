import { WebAuthn } from "@/libs/web-authn/service/web-authn";
import { Button, Flex, TextField } from "@radix-ui/themes";
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

  useEffect(() => {
    WebAuthn.isConditional();
  }, []);

  async function test() {
    if (window.PublicKeyCredential) {
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const result = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log("isUserVerifyingPlatformAuthenticatorAvailable", result);
      } else {
        console.log("isUserVerifyingPlatformAuthenticatorAvailable not supported");
      }
    } else {
      console.log("PublicKeyCredential not supported");
    }
  }

  return (
    <Flex style={css} align="center" justify="center" direction="column">
      <Button>
        <input
          style={cssBtn}
          required
          name="username"
          id="username"
          autoComplete="username webauthn"
        />
      </Button>
      Sign In
      <form
        onSubmit={(e) => {
          e.preventDefault();
          username && WebAuthn.create({ username });
        }}
      >
        <TextField.Input required value={username} onChange={(e) => setUsername(e.target.value)} />
        <Button type={"submit"}>CREATE</Button>
      </form>
      <Button onClick={test}>test</Button>
    </Flex>
  );
}

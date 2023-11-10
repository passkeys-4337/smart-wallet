"use client";

import OnBoarding from "@/components/OnBoarding";
import { WebAuthn } from "@/libs/web-authn/service/web-authn";
import { Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    console.log("window", window);

    const user = localStorage.getItem("user");
    if (user) {
      setSignedIn(true);
    }
  }, []);

  if (signedIn) {
    return (
      <div>
        <h1>Home</h1>
        <Button
          onClick={() => {
            WebAuthn.disconnect();
            setSignedIn(false);
          }}
        >
          Disconnect
        </Button>
      </div>
    );
  } else {
    return <OnBoarding />;
  }
}

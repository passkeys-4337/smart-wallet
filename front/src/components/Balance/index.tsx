"use client";

import { useBalance } from "@/providers/BalanceProvider";
import { Flex, Text } from "@radix-ui/themes";
import { CSSProperties, useEffect } from "react";

const css: CSSProperties = {
  margin: "1rem",
};

export default function Balance() {
  const KEY_ID = "0x9e925f1ff5b39500f805ff205534b589c72603c740b3de6975511818095eec36";

  const { balance, getBalance } = useBalance();

  useEffect(() => {
    getBalance(KEY_ID);
    console.log("balance", balance);
  }, [balance, getBalance]);

  return (
    <Flex style={css} direction="column">
      <Text highContrast={true} color="green" weight="bold" size="8">
        $ {balance.toFixed(2)}
      </Text>
    </Flex>
  );
}

"use client";

import { useBalance } from "@/providers/BalanceProvider";
import { Flex, Text } from "@radix-ui/themes";
import { CSSProperties, useEffect } from "react";

const css: CSSProperties = {
  margin: "1rem",
};

export default function Balance() {
  const { balance } = useBalance();
  let [intBalance, decimals] = balance.toFixed(2).split(".");

  return (
    <Flex style={css} direction="row" justify="center">
      <Text highContrast={true} weight="bold" size="8">
        ${intBalance}
      </Text>
      <Text highContrast={true} color="sky" weight="bold" size="6">
        .{decimals}
      </Text>
    </Flex>
  );
}

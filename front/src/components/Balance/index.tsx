"use client";

import { useBalance } from "@/providers/BalanceProvider";
import { Flex, Text } from "@radix-ui/themes";
import { CSSProperties, useEffect } from "react";

const css: CSSProperties = {
  padding: "2.5rem 0",
};

export default function Balance() {
  const { balance } = useBalance();
  let [intBalance, decimals] = balance.toFixed(2).split(".");

  return (
    <Flex style={css} direction="row" justify="center">
      <Text highContrast={true} weight="bold" size="9">
        ${intBalance}
      </Text>
      <Text highContrast={true} weight="bold" size="6" style={{ color: "var(--accent-12)" }}>
        .{decimals}
      </Text>
    </Flex>
  );
}

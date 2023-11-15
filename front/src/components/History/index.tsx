"use client";

import { useTransaction } from "@/providers/TransactionProvider";
import { Badge, Box, Flex, Link, Separator, Text } from "@radix-ui/themes";
import { Log } from "viem";

export default function History() {
  const { loading, txs } = useTransaction();

  return (
    <Flex direction="column" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      <Text size="6" weight="bold">
        History
      </Text>
      <Separator my="3" size="4" color="gray" />

      <Flex direction="column" gap="2">
        {!loading &&
          Array.isArray(txs) &&
          txs
            .sort((a: Log, b: Log) => {
              return Number(b.blockNumber) - Number(a.blockNumber);
            })
            .map((tx: Log) => {
              return (
                <Box key={tx?.blockNumber}>
                  <Flex direction="row" gap="1" justify="between">
                    <Text size="2">
                      <Link
                        href={`https://goerli.basescan.org/tx/${tx.transactionHash}`}
                        target="_blank"
                      >
                        {tx?.transactionHash?.toString().slice(0, 4)}...
                        {tx?.transactionHash?.toString().slice(-4)}
                      </Link>
                    </Text>
                    <Text size="1">
                      {(tx as unknown as { args: { status: boolean } }).args.status}
                    </Text>
                    <Badge color="green">Complete</Badge>
                  </Flex>
                </Box>
              );
            })}
      </Flex>
    </Flex>
  );
}

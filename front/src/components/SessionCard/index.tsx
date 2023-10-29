/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button, Text, Flex } from "@radix-ui/themes";
import { truncate } from "@/utils/truncate";
import { Url } from "next/dist/shared/lib/router/router";
import { useWalletConnect, IWCReactSession } from "@/libs/wallet-connect";
/**
 * Types
 */
interface IProps {
  wcReactSession: IWCReactSession;
}

/**
 * Component
 */
export default function SessionCard({ wcReactSession }: IProps) {
  const { disconnectSession } = useWalletConnect();

  if (!wcReactSession.session) return <div>no session</div>;

  const { session } = wcReactSession;
  const topic = session.topic;
  const { name, icons, url } = session.peer.metadata;

  return (
    <Flex direction={"column"} gap="1">
      <img src={icons[0]} alt="test" width={100} />
      <Text>name: {name}</Text>
      <Text>topic: {topic}</Text>
      <Link href={url as Url}>
        {truncate(url?.split("https://")[1] ?? "Unknown", 23)}
      </Link>

      <Button onClick={() => disconnectSession(topic)}>
        {wcReactSession.disconnectIsLoading ? "Loading..." : "Disconnect"}
      </Button>
    </Flex>
  );
}

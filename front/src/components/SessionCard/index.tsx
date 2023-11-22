/* eslint-disable @next/next/no-img-element */

import { Text, Flex, Card, IconButton, Link } from "@radix-ui/themes";
import { truncate } from "@/utils/truncate";
import { useWalletConnect, IWCReactSession } from "@/libs/wallet-connect";
import Spinner from "../Spinner";
import { LinkBreak2Icon } from "@radix-ui/react-icons";
import styled from "@emotion/styled";

interface IProps {
  wcReactSession: IWCReactSession;
}

const Name = styled(Text)`
  white-space: normal;
  text-overflow: ellipsis;
  overflow: hidden;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

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
    <Card style={{ width: "100%" }}>
      <Flex gap="1" width={"100%"} justify={"between"} align={"center"}>
        <Flex gap="3">
          <img src={icons[0]} alt="test" width={50} height={50} />
          <Flex direction={"column"}>
            <Name>{name}</Name>
            <Link href={url}>{truncate(url?.split("https://")[1] ?? "Unknown", 23)}</Link>
          </Flex>
        </Flex>

        <IconButton
          size={"3"}
          disabled={wcReactSession.disconnectIsLoading}
          variant="outline"
          onClick={() => disconnectSession(topic)}
        >
          {wcReactSession.disconnectIsLoading ? (
            <Spinner style={{ width: 16, height: 16 }} color="var(--gray-a8)" />
          ) : (
            <LinkBreak2Icon />
          )}
        </IconButton>
      </Flex>
    </Card>
  );
}

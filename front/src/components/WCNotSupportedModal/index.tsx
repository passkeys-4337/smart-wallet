import { Flex, Callout, Heading } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type Props = {
  method: string;
};

export default function WCNotSupportedModal({ method }: Props) {
  return (
    <Flex
      direction="column"
      width="100%"
      justify={"between"}
      align={"center"}
      gap={"3"}
      grow={"1"}
      style={{ overflow: "scroll" }}
    >
      <Flex direction={"column"} gap={"5"} style={{ width: "100%" }}>
        <Heading as={"h2"}>{method}</Heading>

        <Callout.Root color="red" role="alert" style={{ width: "100%" }}>
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{`${method} method through wallet connect has not been implemented yet in this educational project.`}</Callout.Text>
        </Callout.Root>
      </Flex>
    </Flex>
  );
}

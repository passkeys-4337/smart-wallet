import { Box, Flex } from "@radix-ui/themes";
import SessionList from "@/components/SessionList";
import WCInput from "@/components/WCInput";

export default async function Home() {
  return (
    <Flex align="center" direction="column">
      <Box>
        <h1>Hocus Pocus XYZ</h1>
        <br />
        <WCInput />
        <SessionList />
      </Box>
    </Flex>
  );
}

import { Box, Flex } from "@radix-ui/themes";
import SessionList from "@/components/SessionList";
import WCInput from "@/components/WCInput";
import Balance from "@/components/Balance";
import NavBar from "@/components/NavBar";
import History from "@/components/History";

export default async function Home() {
  return (
    <Flex align="center" direction="column">
      <Box>
        <h1>Hocus Pocus XYZ</h1>
        <br />
        <SessionList />
        <Balance />
        <NavBar />
        <History />
        <WCInput />
      </Box>
    </Flex>
  );
}

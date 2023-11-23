import { GearIcon } from "@radix-ui/react-icons";
import { Flex, IconButton } from "@radix-ui/themes";
import Address from "../Address";
import Link from "next/link";

export default function TopBar() {
  return (
    <Flex width="100%" justify="between" align="center">
      <Address style={{ alignSelf: "center" }} />
      <Link href={"/settings"}>
        <IconButton variant="soft" size={"3"}>
          <GearIcon />
        </IconButton>
      </Link>
    </Flex>
  );
}

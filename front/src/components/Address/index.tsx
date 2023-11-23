import { useMe } from "@/providers/MeProvider";
import { AvatarIcon } from "@radix-ui/react-icons";
import { Button, Tooltip } from "@radix-ui/themes";
import { CSSProperties, useState } from "react";

type Props = {
  style?: CSSProperties;
};

export default function Address(props: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const { me } = useMe();

  if (!me) {
    return null;
  }

  return (
    <Tooltip content="Copied!" open={isCopied}>
      <Button
        variant="soft"
        onClick={() => {
          navigator.clipboard.writeText(me?.account || "");
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1000);
        }}
        style={{ ...props.style, display: "flex", alignItems: "center", gap: "6px" }}
        size={"3"}
      >
        <AvatarIcon fill="red" />
        {me?.account.slice(0, 6)}...{me?.account.slice(-4)}
      </Button>
    </Tooltip>
  );
}

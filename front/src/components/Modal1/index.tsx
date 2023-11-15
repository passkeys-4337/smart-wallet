import { Button } from "@radix-ui/themes";
import Modal2 from "../Modal2";
import { useModal } from "@/providers/ModalProvider";
import { SendTransaction } from "@/components/SendTransaction";

export default function Modal1() {
  const { open } = useModal();

  return (
    <div style={{ padding: "1rem" }}>
      {/* <Button onClick={() => open(<Modal2 />)}>SHOW MODAL 2</Button> */}
      <SendTransaction />
    </div>
  );
}

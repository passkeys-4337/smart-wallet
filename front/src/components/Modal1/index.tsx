import { Button } from "@radix-ui/themes";
import Modal2 from "../Modal2";
import { useModal } from "@/providers/ModalProvider";

export default function Modal1() {
  const { open } = useModal();

  return (
    <div>
      Modal1
      <Button onClick={() => open(<Modal2 />)}>SHOW MODAL 2</Button>
    </div>
  );
}

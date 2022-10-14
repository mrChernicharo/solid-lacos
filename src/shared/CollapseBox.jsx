import { Show, createSignal } from "solid-js";
import Button from "./Button";

export default function CollapseBox(props) {
  const [isOpen, setIsOpen] = createSignal(props.isOpen || false);

  return (
    <Show when={isOpen()} fallback={<Button kind="open" onClick={e => setIsOpen(true)} />}>
      <Button kind="close" onClick={e => setIsOpen(false)} />
      {props.children}
    </Show>
  );
}

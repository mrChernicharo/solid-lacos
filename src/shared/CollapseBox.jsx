import { FaSolidChevronRight, FaSolidChevronDown, FaSolidX } from "solid-icons/fa";
import { FiChevronDown, FiX } from "solid-icons/fi";
import { Show, createSignal } from "solid-js";

export default function CollapseBox(props) {
  const [isOpen, setIsOpen] = createSignal(!!props.open);

  return (
    <div data-component="CollapseBox" class="relative">
      <Show
        when={isOpen()}
        fallback={
          <button class="btn btn-ghost absolute right-0 -bottom-[0.66rem]" onClick={e => setIsOpen(true)}>
            <FiChevronDown />
          </button>
        }
      >
        <button
          class="btn btn-ghost absolute right-0 -top-[2.15rem] bottom-auto"
          onClick={e => setIsOpen(false)}
        >
          <FaSolidX />
        </button>
        {props.children}
      </Show>
    </div>
  );
}

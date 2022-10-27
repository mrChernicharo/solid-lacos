import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { createStore, unwrap } from "solid-js/store";

const [toastContext, setToastContext] = createStore([
  // { id: 1, message: "welcome", status: "default", duration: 2000 },
]);

/**
 * @function addToast
 *
 * @param {Object} info
 * @param {string} info.title
 * @param {string} info.message
 * @param {string} info.status
 * @param {number} info.duration
 */
const addToast = info => {
  const id = Math.random();
  const toast = { id, duration: 2000, status: "default", ...info };

  setToastContext(prev => [...prev, toast]);

  console.log("called addToast", unwrap(toastContext));

  setTimeout(() => setToastContext(prev => prev.filter(t => t.id !== id)), toast.duration);
};

function ToastContainer(props) {
  return (
    <div
      data-component="ToastContainer"
      style={{
        position: "fixed",
        top: "2rem",
        right: 0,
        "padding-right": "2rem",
        "user-select": "none",
        "z-index": "1000000",
        "pointer-events": "none",
      }}
    >
      <For each={toastContext}>{toast => <Toast {...toast} />}</For>
    </div>
  );
}

function Toast(props) {
  let toastRef;
  const root = document.documentElement;

  const colors = {
    success: "green",
    warn: "goldenrod",
    danger: "red",
    default: "#eee",
  };

  onMount(() => {
    root.style.setProperty("--toast-duration", props.duration ?? 2000);
  });

  return (
    <div
      ref={toastRef}
      style={{
        width: "fit-content",
        bottom: "100px",
        left: "50%",
        padding: "1rem",
        "border-radius": "10px",
        transform: "translateX(-50%)",
        "z-index": "1000000",
        background: colors[props.status] ? colors[props.status] : colors.default,
        animation: "render-toaster",
        "animation-duration": props.duration / 1000 + "s",
        "animation-timing-function": "ease",
        "animation-fill-mode": "forwards",
      }}
    >
      {props.title && <div class="text-lg font-bold">{props.title}</div>}
      <div>{props.message}</div>
    </div>
  );
}

export { ToastContainer, addToast };

// width: fit-content;
// bottom: 100px;
// left: 50%;

// transform: translateX(-50%);
// z-index: 1000000;
// animation: 100s ease 0s 1 normal forwards running render-toaster;
// background: rgb(238, 238, 238);

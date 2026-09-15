const KEYS = {
  ArrowUp: "north",
  KeyW: "north",
  ArrowRight: "east",
  KeyD: "east",
  ArrowDown: "south",
  KeyS: "south",
  ArrowLeft: "west",
  KeyA: "west",
};
export function createKeyboard(target, { enabled, pause }) {
  let held = [],
    fire = false;
  const controller = new AbortController();
  const clear = () => {
    held = [];
    fire = false;
  };
  target.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape") {
        if (!event.repeat && pause() !== false) event.preventDefault();
        return;
      }
      if (!enabled() || event.target.closest?.("button,input,select,dialog,a"))
        return;
      if (KEYS[event.code]) {
        event.preventDefault();
        if (!event.repeat)
          held = [...held.filter((key) => key !== event.code), event.code];
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) fire = true;
      }
    },
    { signal: controller.signal },
  );
  target.addEventListener(
    "keyup",
    (event) => {
      held = held.filter((key) => key !== event.code);
    },
    { signal: controller.signal },
  );
  return {
    clear,
    read() {
      const input = { direction: KEYS[held.at(-1)] || null, firePressed: fire };
      fire = false;
      return input;
    },
    destroy() {
      controller.abort();
      clear();
    },
  };
}

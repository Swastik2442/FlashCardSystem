import { useEffect, useCallback } from "react"

type ModifierKeys = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey" | "metaKey">

interface KeyPressConfig extends Partial<ModifierKeys> {
  code: KeyboardEvent["code"];
}

/**
 * A Hook that executes a function when a Key is pressed
 * 
 * Ref: <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent>
 * @param onKeyPress Function to be executed when the Key is pressed
 * @param config Configuration for the KeyPress Event
 */
export function useKeyPress(onKeyPress: () => void, config: KeyPressConfig) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { code, ctrlKey, altKey, shiftKey, metaKey } = e;
    if (config.code !== code) return;
    if (config.ctrlKey && !ctrlKey) return;
    if (config.shiftKey && !shiftKey) return;
    if (config.altKey && !altKey) return;
    if (config.metaKey && !metaKey) return;

    onKeyPress();
  }, [onKeyPress, config]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress as EventListener);
    return () => document.removeEventListener("keydown", handleKeyPress as EventListener);
  }, [handleKeyPress]);
}

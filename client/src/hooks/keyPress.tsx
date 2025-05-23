import { useEffect, useCallback, useMemo } from "react"

type ModifierKeys = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey" | "metaKey">

interface KeyPressConfig extends Partial<ModifierKeys> {
  key: KeyboardEvent["key"]
}

interface ShortcutOptions {
  name: string
  where: Set<string>
  description?: string
}
export type KeyboardShortcut = ShortcutOptions & { config: KeyPressConfig }

const registeredShortcuts: KeyboardShortcut[] = []

const getShortcutIndex = (config: KeyPressConfig) => (
  registeredShortcuts.findIndex(v => (
    v.config.key == config.key
    && v.config.altKey == config.altKey
    && v.config.ctrlKey == config.ctrlKey
    && v.config.shiftKey == config.shiftKey
    && v.config.metaKey == config.metaKey
  ))
)

/**
 * @description Registers a Keyboard Shortcut.
 *
 * DO NOT call inside a Component.
 * Use `useKeyPress` Hook to make the Shortcut actually work.
 *
 * @param config KeyPressConfig for the KeyboardEvent to be triggered
 * @param options Other Stats about the Shortcut
 */
export function registerShortcut(
  config: KeyPressConfig,
  options: Omit<ShortcutOptions, "where"> & { where?: Iterable<string> | string }
) {
  const idx = getShortcutIndex(config)
  if (idx == -1) {
    registeredShortcuts.push({
      config,
      ...options,
      where: new Set((typeof options.where === "string") ? [options.where] : options.where)
    })
  } else {
    const prev = registeredShortcuts[idx]
    if (
      prev.name != options.name
      || (options.description && prev.description != options.description)
    ) {
      throw new Error("Similar Keyboard Shortcuts should have same Name and Description")
    }

    prev.description ??= options.description
    if (options.where) {
      if (typeof options.where === "string") {
        prev.where.add(options.where)
      } else {
        for (const v of options.where) {
          prev.where.add(v)
        }
      }
    }
  }
}

/**
 * @returns All registered Keyboard Shortcuts
 */
export const getRegisteredShortcuts = () => registeredShortcuts

/**
 * A Hook that executes a function when a Key is pressed
 *
 * Ref: <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent>
 * @param onKeyPress Function to be executed when the Key is pressed
 * @param config Configuration for the KeyPress Event
 */
export function useKeyPress(onKeyPress: () => void, config: KeyPressConfig) {
  const ksIdx = useMemo(() => getShortcutIndex(config), [config])
  if (ksIdx == -1)
    throw new Error("Key Press Config not Registered. Use registerShortcut to do so.")

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = e;
    if (config.key !== key) return;
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

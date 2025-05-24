import type {
  KeyboardShortcut,
  KeyPressConfig,
  ShortcutOptions
} from "@/features/keyboard/types"
import {
    deleteAllUserShortcuts,
    deleteUserShortcut,
    getUserShortcut,
    saveUserShortcut
} from "./local"
import { areArraysEqual } from "@/utils/others"

const registeredShortcuts: KeyboardShortcut[] = []
const getShortcutIndex = (config: KeyPressConfig) => (
  registeredShortcuts.findIndex(v => (
    v.defaultConfig.key == config.key
    && v.defaultConfig.altKey == config.altKey
    && v.defaultConfig.ctrlKey == config.ctrlKey
    && v.defaultConfig.shiftKey == config.shiftKey
    && v.defaultConfig.metaKey == config.metaKey
  ))
)
export const getRegisteredShortcuts = () => registeredShortcuts
export const getRegisteredShortcut = (index: number) => registeredShortcuts[index]

type RegisterShortcutOptions = Omit<ShortcutOptions, "where"> & {
  where?: Iterable<string> | string
}

/**
 * @description Registers a Keyboard Shortcut.
 *
 * DO NOT call inside a Component.
 * Use `useKeyPress` Hook to make the Shortcut actually work.
 *
 * @param config KeyPressConfig for the KeyboardEvent to be triggered
 * @param options Other Stats about the Shortcut
 * @returns Index associated with the registered Keyboard Shortcut
 */
export async function registerShortcut(config: KeyPressConfig, options: RegisterShortcutOptions) {
  const idx = getShortcutIndex(config)
  if (idx == -1) { // New Entry, add
    const userConfig = await getUserShortcut(options.id)
    registeredShortcuts.push({
      ...options,
      defaultConfig: config,
      userConfig: userConfig ?? null,
      where: new Set((typeof options.where === "string") ? [options.where] : options.where)
    })
    return registeredShortcuts.length - 1
  } else {         // Entry already exists, update
    const prev = registeredShortcuts[idx]
    if (!areArraysEqual(prev.id, options.id) || prev.name != options.name
    || (options.description && prev.description != options.description)) {
      throw new Error("Similar Keyboard Shortcuts should have same ID, Name and Description")
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
    return idx
  }
}

/**
 * @description Sets a User-defined Alternate to a Keyboard Shortcut.
 * @param ksIndex Index of the Shortcut whose Alternate has to be set
 * @param config KeyPressConfig for the KeyboardEvent to be triggered. Leave it to remove the Alternate.
 */
export async function setUserShortcut(ksIndex: number, config: KeyPressConfig | null = null) {
  const ks = registeredShortcuts[ksIndex]
  if (config) {
    ks.userConfig = config
    await saveUserShortcut(ks.id, config)
  } else if (ks.userConfig) {
    await deleteUserShortcut(ks.id)
    ks.userConfig = null
  }
}

/**
 * @description Resets all User-defined Alternates to the Default.
 */
export async function resetUserShortcuts() {
  await deleteAllUserShortcuts()
  registeredShortcuts.forEach((ks) => {
    if (ks.userConfig)
      ks.userConfig = null
  })
}

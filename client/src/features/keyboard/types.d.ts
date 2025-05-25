// Make sure to edit the one in @/features/keyboard/components/keyboardInput.tsx to match the configuration
export type ModifierKeys = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey" | "metaKey">

export interface KeyPressConfig extends Partial<ModifierKeys> {
  key: KeyboardEvent["key"]
}

export interface ShortcutOptions {
  id: string[]
  name: string
  where: Set<string>
  description?: string
}
export type KeyboardShortcut = ShortcutOptions & {
  defaultConfig: KeyPressConfig
  userConfig: Nullable<KeyPressConfig>
}

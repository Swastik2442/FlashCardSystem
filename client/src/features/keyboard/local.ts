import { openDB, DBSchema } from "idb"
import type {
  KeyPressConfig,
  ShortcutOptions
} from "@/features/keyboard/types"

const DB_NAME = "fcs.keyboard.shortcuts"
const DB_VERSION = 1

interface KeyboardShortcutsDB extends DBSchema {
  userShortcuts: {
    key: ShortcutOptions["id"]
    value: KeyPressConfig
  }
}

const db = openDB<KeyboardShortcutsDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion) {
    if (oldVersion == 0 && newVersion == 1) {
      db.createObjectStore("userShortcuts")
    }
  }
})

export async function getUserShortcut(id: ShortcutOptions["id"]) {
  return (await db).get("userShortcuts", id)
}
export async function saveUserShortcut(id: ShortcutOptions["id"], config: KeyPressConfig) {
  await (await db).put("userShortcuts", config, id)
}
export async function deleteUserShortcut(id: ShortcutOptions["id"]) {
  await (await db).delete("userShortcuts", id)
}
export async function deleteAllUserShortcuts() {
  await (await db).clear("userShortcuts")
}

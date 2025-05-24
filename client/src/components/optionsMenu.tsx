import { useState } from "react"
import { User, Keyboard, Cloud, LogOut, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authProvider"
import { useKeyPress } from "@/hooks/keyPress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ConfirmationDialog from "@/components/confirmationDialog"
import KeyboardShortcutsDialog from "@/components/keyboardShortcuts"
import { registerShortcut } from "@/features/keyboard/ks"

const execAt = "Everywhere"
const dashboardKS = await registerShortcut({ key: "b", altKey: true }, {
  id: ["app", "routes", "dashboard"],
  name: "Go to Dashboard",
  where: execAt
})
const userProfileKS = await registerShortcut({ key: "u", altKey: true }, {
  id: ["app", "routes", "userProfile"],
  name: "Show User Profile",
  where: execAt,
  description: "Shows the current User's Profile"
})
const keyboardShortcutsKS = await registerShortcut({ key: "?", shiftKey: true, altKey: true }, {
  id: ["app", "keyboardShortcuts"],
  name: "Show Keyboard Shortcuts",
  where: execAt,
  description: "Shows all the Keyboard Shortcuts"
})

/**
 * A Dropdown Menu that contains Options for a Logged In User.
 * Otherwise, a Button for redirecting to the Login Page.
 */
export function OptionsMenu() {
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()
  const [showKSTable, setShowKsTable] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const showDashboard = () => void navigate("/dashboard")
  const showUserProfile = () => void navigate(`/users/${user}`)
  const toggleKSTable = () => setShowKsTable(v => !v)
  const showAppSettings = () => void navigate("/settings")

  useKeyPress(showDashboard, dashboardKS)
  useKeyPress(showUserProfile, userProfileKS)
  useKeyPress(toggleKSTable, keyboardShortcutsKS)

  function handleLogout() {
    if (user != null) void (async () => {
      try {
        await logoutUser()
        setLogoutDialogOpen(false)
        await navigate("/")
      } catch (err) {
        console.error(err)
        toast.error((err instanceof Error) ? err.message : "Logout Failed")
      }
    })()
  }

  if (user == null)
    return (
      <Button
        onClick={() => void navigate("/auth/login")}
        type="submit"
        title="Options"
        variant="outline"
        size="icon"
      >
        <User />
      </Button>
    )

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="submit" title="Options" variant="outline" size="icon"><User /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex justify-between">
          <span className="select-none">My Account</span>
          <span className="font-extralight">{user}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={showUserProfile}>
          <User />
          <span>Profile</span>
          <DropdownMenuShortcut>Alt U</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleKSTable}>
          <Keyboard />
          <span>Keyboard Shortcuts</span>
          <DropdownMenuShortcut>Alt ⇧?</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={showAppSettings}>
          <Settings />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <span className="sr-only select-none">User Options</span>
    </DropdownMenu>
    <KeyboardShortcutsDialog open={showKSTable} onOpenChange={setShowKsTable} />
    <ConfirmationDialog
      open={logoutDialogOpen}
      onOpenChange={setLogoutDialogOpen}
      onConfirm={handleLogout}
      dialogTitle="Are you sure?"
      dialogMessage="This will log you out of your account."
    />
    </>
  )
}

import { useState } from "react"
import { User, Keyboard, Cloud, LogOut, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authProvider"
import { useKeyPress, registerShortcut } from "@/hooks/keyPress"
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

const dashboardKS = { key: "b", altKey: true }
const userProfileKS = { key: "u", altKey: true }
const keyboardShortcutsKS = { key: "?", shiftKey: true, altKey: true }
const execAt = "Everywhere"

registerShortcut(dashboardKS, {
  name: "Go to Dashboard",
  where: execAt
})
registerShortcut(userProfileKS, {
  name: "Show User Profile",
  where: execAt,
  description: "Shows the current User's Profile"
})
registerShortcut(keyboardShortcutsKS, {
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

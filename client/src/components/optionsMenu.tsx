import { User, Keyboard, Cloud, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { useKeyPress } from "@/hooks/keyPress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/**
 * A Dropdown Menu that contains Options for a Logged In User. Otherwise, a Button for redirecting to the Login Page.
 */
export function OptionsMenu() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const showUserProfile = () => navigate(`/users/${user}`);
  const showKeyboardShortcuts = () => toast.info("Not Implemented Yet");
  const showAppSettings = () => navigate("/settings");

  useKeyPress(showUserProfile, { code: "KeyU", altKey: true });
  useKeyPress(showKeyboardShortcuts, { code: "Slash", shiftKey: true, altKey: true });

  function handleLogout() {
    if (user != null) void (async () => {
      try {
        await logoutUser();
        toast.info("Logged Out");
        navigate("/");
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "Logout Failed");
      }
    })();
  }

  if (user == null)
    return (
      <Button onClick={() => navigate("/auth/login")} type="submit" title="Options" variant="outline" size="icon"><User /></Button>
    );

  return (
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
        <DropdownMenuItem onClick={showKeyboardShortcuts}>
          <Keyboard />
          <span>Keyboard Shortcuts</span>
          <DropdownMenuShortcut>Alt ⇧/</DropdownMenuShortcut>
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
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <span className="sr-only select-none">User Options</span>
      </DropdownMenu>
  );
}

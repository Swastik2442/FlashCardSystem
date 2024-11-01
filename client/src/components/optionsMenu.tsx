import { User, Keyboard, Cloud, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function OptionsMenu() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

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
        <DropdownMenuItem onClick={() => navigate(`/users/${user}`)}>
          <User />
          <span>Profile</span>
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Keyboard />
          <span>Keyboard Shortcuts</span>
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <span className="sr-only select-none">User Options</span>
      </DropdownMenu>
  );
}

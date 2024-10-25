import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  return (
    <Button variant="outline" size="icon">
      <LogIn className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <LogOut className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Login/Logout</span>
    </Button>
  );
}

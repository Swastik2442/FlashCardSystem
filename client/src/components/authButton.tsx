import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/authProvider";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleButtonClick() {
    if (auth.user == null)
      navigate("/auth/login");
    else
      void (async () => {
        try {
          await auth.logoutUser();
        } catch (err) {
          console.error(err);
          toast.error((err instanceof Error) ? err.message : "Logout Failed");
        }
      })();
  }

  return (
    <Button onClick={handleButtonClick} variant="outline" size="icon">
      {
        auth.user == null
        ? <LogIn className="h-[1.2rem] w-[1.2rem]" />
        : <LogOut className="h-[1.2rem] w-[1.2rem]" />
      }
      <span className="sr-only">{auth.user == null ? "Login" : "Logout"}</span>
    </Button>
  );
}

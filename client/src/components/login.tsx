import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  function handleLogin(e: FormEvent) {
    e.preventDefault();

    // Add Validation of Email and Password

    void (async () => {
      try {
        await auth.loginUser(new FormData(e.target as HTMLFormElement));
        toast.success("Logged in Successfully");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "Failed to Login");
      }
    })();
  }

  return (
    <form onSubmit={handleLogin} className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 w-full sm:w-96">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

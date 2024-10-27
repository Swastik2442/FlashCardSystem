import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleRegister(e: FormEvent) {
    e.preventDefault();

    // Add Validation of Form Data

    void (async () => {
      try {
        await auth.registerUser(new FormData(e.target as HTMLFormElement));
        toast.success("Registration Successfully");
        navigate("/auth/login");
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "Failed to Register");
      }
    })();
  }

  return (
    <form onSubmit={handleRegister} className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 w-full sm:w-96">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" name="fullName" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="underline">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

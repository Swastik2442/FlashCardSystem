import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  return (
    <form className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 w-full sm:w-96">
            <div className="grid gap-2">
              <Label htmlFor="email">Email/Username</Label>
              <Input id="email" type="text" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" onClick={() => toast("Ok bro")}>
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

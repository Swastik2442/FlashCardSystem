/* eslint-disable @typescript-eslint/no-misused-promises */
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginFormSchema } from "@/types/forms";
import type { TLoginFormSchema } from "@/types/forms";

/**
 * Component for the Login page
 */
export default function Login() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const loginForm = useForm<TLoginFormSchema>({
    resolver: zodResolver(loginFormSchema)
  });
  if (user)
    return <Navigate to="/dashboard" replace={true} />;

  async function handleLogin(values: TLoginFormSchema) {
    try {
      await loginUser(values);
      toast.success("Logged in Successfully");
      await navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Login");
    }
  }

  return (
    <div className="grid h-screen w-full items-center justify-center px-4 sm:px-0">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
        <Form {...loginForm}>
          <form className="grid gap-4 w-full sm:w-96" onSubmit={loginForm.handleSubmit(handleLogin)}>
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" title="Login">Login</Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?&nbsp;
          <Link to="/auth/register" className="underline">
            Sign up
          </Link>
        </div>
        <div className="text-center text-sm">
          <Link to="#" className="underline" onClick={() => toast.info("Not implemented yet")}>
            Forgot Password?
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

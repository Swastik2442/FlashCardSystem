/* eslint-disable @typescript-eslint/no-misused-promises */
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string()
  .min(8, { message: "Password must be at least 8 characters." })
  .max(128, { message: "Password cannot be more than 128 characters." }),
});

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema)
  });

  async function handleLogin(values: z.infer<typeof loginFormSchema>) {
    try {
      await auth.loginUser(values);
      toast.success("Logged in Successfully");
      navigate("/dashboard");
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
            <Button type="submit">Login</Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/auth/register" className="underline">
            Sign up
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

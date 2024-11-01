/* eslint-disable @typescript-eslint/no-misused-promises */
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerFormSchema } from "@/types/forms";
import type { TRegisterFormSchema } from "@/types/forms";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const registerForm = useForm<TRegisterFormSchema>({
    resolver: zodResolver(registerFormSchema)
  });

  async function handleRegister(values: TRegisterFormSchema) {
    try {
      await auth.registerUser(values);
      toast.success("Registration Successful");
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Register");
    }
  }

  return (
    <div className="grid h-screen w-full items-center justify-center px-4 sm:px-0">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
        <Form {...registerForm}>
          <form className="grid gap-4 w-full sm:w-96" onSubmit={registerForm.handleSubmit(handleRegister)}>
            <FormField
              control={registerForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
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
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
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
            <Button type="submit" title="Register">Register</Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="underline">
            Login
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

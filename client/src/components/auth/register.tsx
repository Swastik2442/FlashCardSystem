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

const registerFormSchema = z.object({
  fullName: z.string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(64, { message: "Name cannot be more than 64 characters." }),
  email: z.string().email("Invalid email address."),
  username: z.string().toLowerCase()
    .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores." })
    .min(2, { message: "Username must be at least 2 characters." })
    .max(32, { message: "Username cannot be more than 32 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
});

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema)
  });

  async function handleRegister(values: z.infer<typeof registerFormSchema>) {
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
            <Button type="submit">Register</Button>
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

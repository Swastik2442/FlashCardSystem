/* eslint-disable @typescript-eslint/no-misused-promises */
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userDetailsFormSchema } from "@/types/forms";
import type { TUserDetailsFormSchema } from "@/types/forms";
import { getUserPrivate } from "@/api/user";

type IUserOptionsData = Omit<IUser, "email" | "username">

export async function UserOptionsLoader(): Promise<IUserOptionsData> {
  const userDetails = await getUserPrivate();
  return userDetails;
}

export function UserOptions({ data }: { data: IUserOptionsData }) {
  return (
    <>
    <div>
      <p className="text-lg p-2">Public Profile</p>
      <hr />
      <div className="p-2">
        <UserUpdateForm userDetails={data} />
      </div>
    </div>
  </>
  )
}

function UserUpdateForm({ userDetails }: { userDetails: IUserOptionsData }) {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const userDetailsForm = useForm<TUserDetailsFormSchema>({
    resolver: zodResolver(userDetailsFormSchema),
    defaultValues: userDetails,
  });

  async function handleDetailsUpdate(values: TUserDetailsFormSchema) {
    try {
      await updateUser(values);
      toast.success("User updated successfully");
      userDetailsForm.reset({}, { keepDirtyValues: true });
      navigate(0);
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Update User");
    }
  }

  return (
    <Form {...userDetailsForm}>
      <form onSubmit={userDetailsForm.handleSubmit(handleDetailsUpdate)}>
        <FormField
          control={userDetailsForm.control}
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
        {userDetailsForm.formState.isDirty && <div className="flex gap-2 my-4">
          <Button type="submit" title="Update">Update</Button>
          <Button onClick={() => userDetailsForm.reset()} type="button" title="Cancel" variant="outline">Cancel</Button>
        </div>}
      </form>
    </Form>
  );
}

export default UserOptions

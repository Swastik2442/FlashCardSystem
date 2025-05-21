import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { userDetailsFormSchema } from "@/types/forms"
import type { TUserDetailsFormSchema } from "@/types/forms"
import { updateUser } from "@/api/user"
import { useCurrentUserQuery } from "@/hooks/userQueries"

type IUserOptionsData = Omit<IUser, "email" | "username">

export function UserOptions() {
  const userQuery = useCurrentUserQuery((data) => {
    const keys = Object.keys({} as IUserOptionsData) as (keyof IUserOptionsData)[]
    const result = {} as IUserOptionsData
    keys.forEach((key) => {
      result[key] = data[key]
    })
    return result
  })
  return (
    <>
    <div>
      <p className="text-lg p-2">Public Profile</p>
      <hr />
      <div className="p-2">
        {userQuery.data && <UserUpdateForm userDetails={userQuery.data} />}
      </div>
    </div>
  </>
  )
}

function UserUpdateForm({ userDetails }: { userDetails: IUserOptionsData }) {
  const navigate = useNavigate()
  const userDetailsForm = useForm<TUserDetailsFormSchema>({
    resolver: zodResolver(userDetailsFormSchema),
    defaultValues: userDetails,
  })

  async function handleDetailsUpdate(values: TUserDetailsFormSchema) {
    try {
      await updateUser(values)
      toast.success("User updated successfully")
      userDetailsForm.reset({}, { keepDirtyValues: true })
      await navigate(0)
    } catch (err) {
      console.error(err)
      toast.error((err instanceof Error) ? err.message : "Failed to Update User")
    }
  }

  return (
    <Form {...userDetailsForm}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
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
          <Button
            onClick={() => userDetailsForm.reset()}
            type="button"
            title="Cancel"
            variant="outline"
          >Cancel</Button>
        </div>}
      </form>
    </Form>
  )
}

export default UserOptions

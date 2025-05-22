/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authProvider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
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
import {
  changeUsernameFormSchema,
  changeEmailFormSchema
} from "@/types/forms"
import type {
  TChangeUsernameFormSchema,
  TChangeEmailFormSchema
} from "@/types/forms"
import { useCurrentUserQuery } from "@/hooks/userQueries"

export function AccountOptions() {
  const userQuery = useCurrentUserQuery()
  return (
    <>
      <div>
        <p className="text-lg p-2">Username</p><hr />
        <div className="p-2">
          {userQuery.data && <ChangeUsernameForm username={userQuery.data?.username} />}
        </div>
      </div>
      <div>
        <p className="text-lg p-2">Email</p><hr />
        <div className="p-2">
          {userQuery.data && <ChangeEmailForm email={userQuery.data?.email} />}
        </div>
      </div>
      <div>
        <p className="text-lg p-2 text-destructive">Delete Account</p><hr />
        <div className="p-2">
          <DeleteAccountOption />
        </div>
      </div>
    </>
  )
}

function ChangeUsernameForm({ username }: { username: string }) {
  const [formActive, setFormActive] = useState(false)
  const { changeUsername } = useAuth()
  const usernameForm = useForm<TChangeUsernameFormSchema>({
    resolver: zodResolver(changeUsernameFormSchema),
    defaultValues: {
      username: username,
    },
  })

  async function handleUsernameChange(values: TChangeUsernameFormSchema) {
    try {
      await changeUsername(values)
      setFormActive(false)
      toast.success("Username changed successfully")
      usernameForm.reset()
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("An error occurred while changing the username", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Change Username")
    }
  }

  if (!formActive) {
    return (
      <Button
        onClick={() => setFormActive(true)}
        type="button"
        title="Change Username"
        variant="secondary"
      >Change Username</Button>
    )
  }

  return (
    <Form {...usernameForm}>
      <form className="grid gap-2" onSubmit={usernameForm.handleSubmit(handleUsernameChange)}>
        <FormField
          control={usernameForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input disabled={!formActive} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={usernameForm.control}
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
        <Button
          onClick={() => setFormActive(false)}
          type="button"
          title="Cancel"
          variant="outline"
        >Cancel</Button>
        <Button type="submit" title="Save">Save</Button>
      </form>
    </Form>
  )
}

function ChangeEmailForm({ email }: { email: string }) {
  const [formActive, setFormActive] = useState(false)
  const { changeEmail } = useAuth()
  const emailForm = useForm<TChangeEmailFormSchema>({
    resolver: zodResolver(changeEmailFormSchema),
    defaultValues: {
      email: email,
    },
  })

  async function handleEmailChange(values: TChangeEmailFormSchema) {
    try {
      await changeEmail(values)
      setFormActive(false)
      toast.success("Email changed successfully")
      emailForm.reset()
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("An error occurred while changing the user email", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Change Email")
    }
  }

  if (!formActive) {
    return (
      <Button
        onClick={() => setFormActive(true)}
        type="button"
        title="Change Email"
        variant="secondary"
      >Change Email</Button>
    )
  }

  return (
    <Form {...emailForm}>
      <form className="grid gap-2" onSubmit={emailForm.handleSubmit(handleEmailChange)}>
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={!formActive} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={emailForm.control}
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
        <Button
          onClick={() => setFormActive(false)}
          type="button"
          title="Cancel"
          variant="outline"
        >Cancel</Button>
        <Button type="submit" title="Save">Save</Button>
      </form>
    </Form>
  )
}

function DeleteAccountOption() {
  const navigate = useNavigate()
  const { deleteUser } = useAuth()

  const handleUserDeletion = async () => {
    await deleteUser()
    await navigate("/")
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          title="Delete Account"
          variant="destructive"
        >Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all the decks owned by you.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUserDeletion}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AccountOptions

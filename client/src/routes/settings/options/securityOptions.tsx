/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authProvider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordFormSchema } from "@/types/forms";
import type { TChangePasswordFormSchema } from "@/types/forms";

export function SecurityOptions() {
  return (
    <>
      <div>
        <div className="flex justify-between">
          <span className="text-lg p-2">Password</span>
          <ChangePasswordOption />
        </div>
        <hr />
        <p className="text-sm text-muted-foreground p-2">
          Changing the Password logs you out in all other sessions.
        </p>
      </div>
    </>
  )
}

function ChangePasswordOption() {
  const { changePassword } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const passwordForm = useForm<TChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleFormCancel = () => {
    setDialogOpen(false);
    passwordForm.clearErrors();
  }

  async function handlePasswordCreation(values: TChangePasswordFormSchema) {
    try {
      await changePassword(values);
      setDialogOpen(false);
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to change the Password");
    }
  }

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} type="button" title="Change Password"variant="secondary" >Change Password</Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change the Password</DialogTitle>
            <DialogDescription>
              Create a new Password for your Profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form className="grid gap-2 py-2" onSubmit={passwordForm.handleSubmit(handlePasswordCreation)}>
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                    <FormLabel className="text-right">Old Password</FormLabel>
                    <FormControl>
                      <Input className="!mt-0 col-span-3" type="password" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                    <FormLabel className="text-right">New Password</FormLabel>
                    <FormControl>
                      <Input className="!mt-0 col-span-3" type="password" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={handleFormCancel} type="button" title="Cancel" variant="outline">Cancel</Button>
                <Button onClick={() => passwordForm.reset()} type="button" title="Reset" variant="secondary">Reset</Button>
                <Button type="submit" title="Change">Change</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SecurityOptions

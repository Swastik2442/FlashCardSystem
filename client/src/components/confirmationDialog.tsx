import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmButtonTitle?: string;
  dialogTitle?: string;
  dialogMessage?: string;
}

/**
 * An Alert Dialog that asks for confirmation before proceeding with an action.
 * @param open Whether the dialog is Open or not
 * @param onOpenChange Function to set the Dialog Open or Closed
 * @param onConfirm Function to be called when the user confirms the action
 * @param confirmButtonTitle Title of the confirmation button (default: "Confirm")
 * @param dialogTitle Title of the dialog (default: "Are you absolutely sure?")
 * @param dialogMessage Message in the dialog (default: "This action cannot be undone. Proceed with Caution.")
 */
export default function ConfirmationDialog({ open, onOpenChange, onConfirm, confirmButtonTitle, dialogTitle, dialogMessage }: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dialogTitle ?? "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dialogMessage ?? "This action cannot be undone. Proceed with Caution."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmButtonTitle ?? "Confirm"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

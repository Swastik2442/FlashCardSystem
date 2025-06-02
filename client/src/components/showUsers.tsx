import { ComponentPropsWithoutRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/css"

/**
 * A Component to show a list of Users inline.
 * @param users Users to be shown
 * @param removeUser Function to call when a User is removed
 */
export function ShowUsers({
  users, removeUser, className, ...props
}: {
  users: IUser[]
  removeUser: (index: number) => void
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div {...props} className={cn(
      "border p-1 rounded-md shadow-sm w-full whitespace-nowrap overflow-hidden scroll-auto",
      className
    )}>
      {users.map((u, idx) => (
        <div key={idx} className="flex">
          <span className="select-none border rounded-l-md shadow-sm p-1" title={u.username}>
            {u.fullName}
          </span>
          <Button
            onClick={() => removeUser(idx)}
            className="py-4 border-l-0 rounded-l-none"
            type="button"
            title="Remove"
            variant="outline"
            size="sm"
          ><X/></Button>
        </div>
      ))}
    </div>
  )
}

export default ShowUsers

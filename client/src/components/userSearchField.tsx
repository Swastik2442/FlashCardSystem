import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { FormControl } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { getUserFromSubstring } from "@/api/user";
import { cn } from "@/utils/css";
import { SEARCH_USERS_STORAGE_KEY } from "@/constants";

/**
 * @returns Users stored in the Local Storage if any
 */
function getStoredUsers() {
  const localUsers = localStorage.getItem(SEARCH_USERS_STORAGE_KEY);
  if (!localUsers) return [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const storedUsers = JSON.parse(localUsers);
  if (!Array.isArray(storedUsers)) {
    localStorage.removeItem(SEARCH_USERS_STORAGE_KEY);
    return [];
  }
  for (const user of storedUsers) {
    if (user satisfies IUserWithID) continue;
    localStorage.removeItem(SEARCH_USERS_STORAGE_KEY);
    return [];
  }
  return storedUsers as IUserWithID[];
}

// BUG: Drawer won't show newly added users on search, but when search item is cleared
/**
 * A Search Field for searching Users
 * @param value User selected in the Form
 * @param onSelect Event handler called when a User is selected
 */
export function UserSearchField({
  value,
  onSelect,
}: {
  value: string,
  onSelect: (user: IUserWithID) => void,
}) {
  const [usersList, setUsersList] = useState<IUserWithID[]>(getStoredUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {void (async () => {
      if (searchTerm.length < 2) return;
      try {
        const newUsers = await getUserFromSubstring(searchTerm);
        setUsersList((prevUsersList) => {
          const allUsers = [...newUsers, ...prevUsersList.filter(
            (prevUser) => !newUsers.some((newUser) => newUser._id === prevUser._id)
          )].slice(0, 10);
          localStorage.setItem(SEARCH_USERS_STORAGE_KEY, JSON.stringify(allUsers));
          return allUsers;
        });
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "No such User found");
      }
    })()}, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (isDesktop)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button type="button" title="Select User" variant="outline" role="combobox" className={cn(
              "!mt-0 col-span-3 justify-between",
              !value && "text-muted-foreground"
            )}>
              {value ? usersList.find((user) => user._id === value)?.username : "Select User"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search User..." onValueChange={(val) => setSearchTerm(val)} />
            <CommandList>
              <CommandEmpty>No User found.</CommandEmpty>
              <CommandGroup>
                {usersList.map((user) => (
                  <CommandItem value={user.username} key={user._id} onSelect={() => {
                    onSelect(user);
                  }}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        user._id === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.username}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <FormControl>
          <Button type="button" title="Select User" variant="outline" role="combobox" className={cn(
            "!mt-0 col-span-3 justify-between",
            !value && "text-muted-foreground"
          )}>
            {value ? usersList.find((user) => user._id === value)?.username : "Select User"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </DrawerTrigger>
      <DrawerContent>
        <Command>
          <CommandInput placeholder="Search User..." onValueChange={(val) => setSearchTerm(val)} />
          <CommandList>
            <CommandEmpty>No User found.</CommandEmpty>
            <CommandGroup>
              {usersList.map((user) => (
                <CommandItem key={user._id} value={user._id} onSelect={() => {
                  onSelect(user);
                  setDrawerOpen(false);
                }}>
                  {user.username}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DrawerContent>
    </Drawer>
  );
}

export default UserSearchField;

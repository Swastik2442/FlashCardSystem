/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Heart, Play, Plus, EllipsisVertical, Pencil, Share2, Trash2, Check, ChevronsUpDown, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/authProvider";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ConfirmationDialog from "@/components/confirmationDialog";
import { cn } from "@/utils/css";
import { deckFormSchema, deckShareFormSchema, cardFormSchema } from "@/types/forms";
import type { TDeckFormSchema, TDeckShareFormSchema, TCardFormSchema } from "@/types/forms";
import { likeDeck, removeDeck, shareDeck, unlikeDeck, updateDeck } from "@/api/deck";
import { createCard } from "@/api/card";
import { getUserFromSubstring } from "@/api/user";
import { SEARCH_USERS_STORAGE_KEY } from "@/constants";

interface IDeckOptionsProps {
  deckID: string;
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function DeckPlayButton({ deckID, cardsCount }: { deckID: string, cardsCount: number }) {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(`/play/${deckID}`, { replace: true })} type="button" title="Play" disabled={cardsCount == 0}>
      <Play />
      <span className="select-none">Play</span>
    </Button>
  );
}

export function DeckLikeButton({ deckID, likes, isLiked }: { deckID: string, likes: number, isLiked: boolean }) {
  const [userLiked, setUserLiked] = useState(isLiked);
  const handleDeckLike = async () => {
    if (userLiked) {
      await unlikeDeck(deckID);
      setUserLiked(false);
    } else {
      await likeDeck(deckID);
      setUserLiked(true);
    }
  }

  return (
    <Button onClick={handleDeckLike} type="submit" title="Like Deck" variant="ghost">
      <Heart fill={userLiked ? "currentColor" : "none"} />
      <span className="select-none">{likes + (userLiked ? 1 : 0)}</span>
    </Button>
  );
}

export function CardCreationDialog({ deckID }: { deckID: string }) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const cardForm = useForm<TCardFormSchema>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { hint: "" },
  })

  async function handleCardCreation(values: TCardFormSchema) {
    setDialogOpen(false);
    try {
      await createCard({ ...values, deck: deckID });
      toast.success("Card Created", { description: values.question });
      cardForm.reset();
      navigate(`/deck/${deckID}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Deck");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" title="Create Card" variant="outline" size="icon"><Plus /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Card</DialogTitle>
          <DialogDescription>
            Add a new card to the deck
          </DialogDescription>
        </DialogHeader>
        <Form {...cardForm}>
          <form className="grid gap-2 py-2" onSubmit={cardForm.handleSubmit(handleCardCreation)}>
            <FormField
              control={cardForm.control}
              name="question"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Question</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={cardForm.control}
              name="answer"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Answer</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={cardForm.control}
              name="hint"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Hint</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" title="Cancel" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" title="Create">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeckOptionsDropdown({ deckID, deck, owner }: { deckID: string, deck: IMoreDeck, owner: string }) {
  const { user } = useAuth();
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const openEditDialog = () => {
    setEditDialogOpen(true);
    setDropdownMenuOpen(false);
  };
  const openShareDialog = () => {
    setShareDialogOpen(true);
    setDropdownMenuOpen(false);
  };
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDropdownMenuOpen(false);
  };

  return (
    <>
      <DropdownMenu open={dropdownMenuOpen} onOpenChange={setDropdownMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" title="Options" variant="outline" size="icon"><EllipsisVertical /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={openEditDialog}>
            <Pencil />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openShareDialog} disabled={user != owner}>
            <Share2 />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDeleteDialog} disabled={user != owner}>
            <Trash2 />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeckEditDialog deckID={deckID} deck={deck} dialogOpen={editDialogOpen} setDialogOpen={setEditDialogOpen} />
      {user == owner && <>
        <DeckShareDialog deckID={deckID} dialogOpen={shareDialogOpen} setDialogOpen={setShareDialogOpen} />
        <DeckDeleteDialog deckID={deckID} dialogOpen={deleteDialogOpen} setDialogOpen={setDeleteDialogOpen} />
      </>}
    </>
  );
}

function DeckDeleteDialog({ deckID, dialogOpen, setDialogOpen }: IDeckOptionsProps) {
  const navigate = useNavigate();
  function handleDeckDeletion() {
    void (async () => {
      try {
        await removeDeck(deckID);
        toast.info("Deck Deleted");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Failed to Delete Deck");
        toast.error("Failed to Delete Deck");
      }
    })();
  }

  return (
    <ConfirmationDialog open={dialogOpen} onOpenChange={setDialogOpen} onConfirm={handleDeckDeletion} dialogMessage="This action cannot be undone. This will permanently delete the deck and remove all the cards present in it." confirmButtonTitle="Delete" />
  );
}

function DeckEditDialog({ deckID, deck, dialogOpen, setDialogOpen }: { deckID: string, deck: IMoreDeck, dialogOpen: boolean, setDialogOpen: Dispatch<SetStateAction<boolean>> }) {
  const navigate = useNavigate();
  const deckForm = useForm<TDeckFormSchema>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description,
      isPrivate: deck.isPrivate,
    },
  });

  async function handleDeckEditing(values: TDeckFormSchema) {
    setDialogOpen(false);
    try {
      await updateDeck(deckID, values);
      toast.success("Deck Edited");
      deckForm.reset();
      navigate(`/deck/${deckID}`, { replace: true });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Failed to Edit the Deck");
      toast.error("Failed to Edit the Deck");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Edit the details of the Deck.
          </DialogDescription>
        </DialogHeader>
        <Form {...deckForm}>
          <form className="grid gap-2" onSubmit={deckForm.handleSubmit(handleDeckEditing)}>
            <FormField
              control={deckForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={deckForm.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Description</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Textarea className="col-span-3" placeholder="My New Deck" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={deckForm.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Private</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Switch className="col-span-3" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="reset" title="Reset" variant="ghost" onClick={() => deckForm.reset()}>Reset</Button>
              <Button type="button" title="Cancel" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" title="Edit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeckShareDialog({ deckID, dialogOpen, setDialogOpen }: IDeckOptionsProps) {
  const deckShareForm = useForm<TDeckShareFormSchema>({
    resolver: zodResolver(deckShareFormSchema),
    defaultValues: {
      isEditable: false,
      unshare: false,
    },
  });

  const handleLinkCopy = () => {
    void navigator.clipboard.writeText(`${import.meta.env.VITE_CLIENT_HOST}/deck/${deckID}`);
    toast.info("Link Copied");
  }
  const handleShareCancel = () => setDialogOpen(false);

  async function handleDeckSharing(values: TDeckShareFormSchema) {
    setDialogOpen(false);
    try {
      await shareDeck(deckID, values);
      toast.success("Deck  Shared");
      deckShareForm.reset();
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Share the Deck");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Deck</DialogTitle>
          <DialogDescription>
            Share the Deck to others. Copy the link below and share it with your friends.
          </DialogDescription>
        </DialogHeader>
        <Form {...deckShareForm}>
          <form className="grid gap-2" onSubmit={deckShareForm.handleSubmit(handleDeckSharing)}>
            <FormField
              control={deckShareForm.control}
              name="user"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">User</FormLabel>
                  <UserSearchField form={deckShareForm} value={field.value} />
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={deckShareForm.control}
              name="isEditable"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Can Edit?</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Switch className="col-span-3" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={deckShareForm.control}
              name="unshare"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Remove Sharing</FormLabel>
                  <FormControl style={{ marginTop: 0 + 'px' }}>
                    <Switch className="col-span-3" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" title="Link" variant="ghost" onClick={handleLinkCopy}><Link2 /></Button>
              <Button type="button" title="Cancel" variant="outline" onClick={handleShareCancel}>Cancel</Button>
              <Button type="submit" title="Edit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getInitialUsers() {
  const localUsers = localStorage.getItem(SEARCH_USERS_STORAGE_KEY);
  if (!localUsers || localUsers.length < 50)
    return [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const storedUsers = JSON.parse(localUsers);
  if (!Array.isArray(storedUsers)) {
    localStorage.removeItem(SEARCH_USERS_STORAGE_KEY);
    return [];
  }
  for (const user of storedUsers) {
    if (user satisfies IUserWithID)
      continue;
    localStorage.removeItem(SEARCH_USERS_STORAGE_KEY);
    return [];
  }
  return storedUsers as IUserWithID[];
}

  // BUG: Drawer won't show newly added users on search, but when search item is cleared
function UserSearchField({ form, value }: { form: ReturnType<typeof useForm<TDeckShareFormSchema>>, value: string }) {
  const [usersList, setUsersList] = useState<IUserWithID[]>(getInitialUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length < 2) return;
      try {
        const users = await getUserFromSubstring(searchTerm)
        setUsersList(users);
        localStorage.setItem(SEARCH_USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "No such User found");
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (isDesktop)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <FormControl style={{ marginTop: 0 + 'px' }}>
            <Button type="button" title="Select User" variant="outline" role="combobox" className={cn(
              "col-span-3 justify-between",
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
                    form.setValue("user", user._id)
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
        <FormControl style={{ marginTop: 0 + 'px' }}>
          <Button type="button" title="Select User" variant="outline" role="combobox" className={cn(
            "col-span-3 justify-between",
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
                  form.setValue("user", user._id);
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

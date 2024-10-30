/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Heart, Play, Plus, EllipsisVertical, Pencil, Share2, Trash2, Check, ChevronsUpDown, Link2 } from "lucide-react";
import { useAuth, fetchWithAuth } from "@/hooks/authProvider";
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

interface SearchUser extends IUser {
  id: string;
}

interface IDeckOptionsProps {
  deckID: string;
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function DeckPlayButton({ deckID, cardsCount }: { deckID: string, cardsCount: number }) {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(`/play/${deckID}`, { replace: true })} disabled={cardsCount == 0}>
      <Play />
      <span className="select-none">Play</span>
    </Button>
  );
}

export function DeckLikeButton({ deckID, likes, isLiked }: { deckID: string, likes: number, isLiked: boolean }) {
  const [userLiked, setUserLiked] = useState(isLiked);
  const handleDeckLike = () => {
    if (userLiked) {
      fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/likes/remove/${deckID}`,
        "post"
      ).then((res) => {
        if (res.ok) {
          setUserLiked(false);
        }
      }).catch((err: Error) => {
        console.error(err.message || "Failed to unlike deck");
      });
    } else {
      fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/likes/add/${deckID}`,
        "post"
      ).then((res) => {
        if (res.ok) {
          setUserLiked(true);
        }
      }).catch((err: Error) => {
        console.error(err.message || "Failed to like deck");
      });
    }
  }

  return (
    <Button onClick={handleDeckLike} variant="ghost">
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
      await fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/card/new`,
        "post",
        JSON.stringify({
          question: values.question,
          answer: values.answer,
          hint: values.hint,
          deck: deckID
        }),
      ).then(async (res) => {
        const data = await res.json() as ICustomResponse<string | null>;
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Create a Card");
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Create a Card");
      });
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
        <Button variant="outline" size="icon"><Plus /></Button>
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
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
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
          <Button variant="outline" size="icon"><EllipsisVertical /></Button>
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
  const handleDeckDeletion = () => {
    void (async () => await fetchWithAuth(
      `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
      "delete"
    ).then((res) => {
      if (!res.ok)
        throw new Error("Failed to delete deck");

      toast.info("Deck Deleted");
      navigate("/dashboard", { replace: true });
    }).catch((err: Error) => {
      console.error(err.message || "Failed to delete deck");
      toast.error("Failed to delete deck");
    }))();
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
      await fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
        "PATCH",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as ICustomResponse<string | null>;
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Edit the Deck");
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Edit the Deck");
      });
      toast.success("Deck Edited");
      deckForm.reset();
      navigate(`/deck/${deckID}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Edit the Deck");
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
              <Button variant="ghost" type="reset" onClick={() => deckForm.reset()}>Reset</Button>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Edit</Button>
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
      await fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/share/${deckID}`,
        "post",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as ICustomResponse<string | null>;
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Share the Deck");
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Share the Deck");
      });
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
              <Button type="button" variant="ghost" onClick={handleLinkCopy}><Link2 /></Button>
              <Button type="button" variant="outline" onClick={handleShareCancel}>Cancel</Button>
              <Button type="submit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getInitialUsers() {
  const localUsers = localStorage.getItem("fcs-users");
  if (!localUsers || localUsers.length < 50)
    return [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const storedUsers = JSON.parse(localUsers);
  if (!Array.isArray(storedUsers)) {
    localStorage.removeItem("fcs-users");
    return [];
  }
  for (const user of storedUsers) {
    if (user satisfies SearchUser)
      continue;
    localStorage.removeItem("fcs-users");
    return [];
  }
  return storedUsers as SearchUser[];
}

  // BUG: Drawer won't show newly added users on search, but when search item is cleared
function UserSearchField({ form, value }: { form: ReturnType<typeof useForm<TDeckShareFormSchema>>, value: string }) {
  const [usersList, setUsersList] = useState<SearchUser[]>(getInitialUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length < 2) return;
      try {
        await fetchWithAuth(
          `${import.meta.env.VITE_SERVER_HOST}/user/getsub/${searchTerm}`,
          "get",
        ).then(async (res) => {
          const data = await res.json() as ICustomResponse<SearchUser[]>;
          if (!res?.ok)
            throw new Error(data?.message || "No such User found");
          setUsersList(data.data);
          localStorage.setItem("fcs-users", JSON.stringify(data.data));
        }).catch((err: Error) => {
          throw new Error(err?.message || "No such User found");
        });
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
            <Button variant="outline" role="combobox" className={cn(
              "col-span-3 justify-between",
              !value && "text-muted-foreground"
            )}>
              {value ? usersList.find((user) => user.id === value)?.username : "Select User"}
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
                  <CommandItem value={user.username} key={user.id} onSelect={() => {
                    form.setValue("user", user.id)
                  }}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        user.id === value ? "opacity-100" : "opacity-0"
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
          <Button variant="outline" role="combobox" className={cn(
            "col-span-3 justify-between",
            !value && "text-muted-foreground"
          )}>
            {value ? usersList.find((user) => user.id === value)?.username : "Select User"}
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
                <CommandItem key={user.id} value={user.id} onSelect={() => {
                  form.setValue("user", user.id);
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

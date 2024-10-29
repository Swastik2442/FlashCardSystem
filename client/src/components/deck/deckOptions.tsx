/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Heart, Play, Plus, EllipsisVertical, Pencil, Share2, Trash2 } from "lucide-react";
import { useAuth, fetchWithAuth } from "@/hooks/authProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deckFormSchema, deckShareFormSchema, cardFormSchema } from "@/types/forms";
import type { TDeckFormSchema, TDeckShareFormSchema, TCardFormSchema } from "@/types/forms";

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
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeckOptionsDropdown({ deckID, owner }: { deckID: string, owner: string }) {
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

      <DeckEditDialog deckID={deckID} dialogOpen={editDialogOpen} setDialogOpen={setEditDialogOpen} />
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
      if (res.ok) {
        toast.info("Deck Deleted");
        navigate("/dashboard", { replace: true });
      }
    }).catch((err: Error) => {
      console.error(err.message || "Failed to delete deck");
      toast.error("Failed to delete deck");
    }))();
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the deck and remove all the cards present in it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeckDeletion}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeckEditDialog({ deckID, dialogOpen, setDialogOpen }: IDeckOptionsProps) {
  const navigate = useNavigate();
  const deckForm = useForm<TDeckFormSchema>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      description: "",
      isPrivate: true,
    },
  });

  // TODO: Add a Reset Button
  // TODO: Maybe add a check to determine what values changed and only send them
  async function handleDeckEditing(values: TDeckFormSchema) {
    setDialogOpen(false);
    try {
      await fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
        "PATCH",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as ICustomResponse<string | null>;
        console.log(data);
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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

  async function handleDeckSharing(values: TDeckShareFormSchema) {
    setDialogOpen(false);
    try {
      await fetchWithAuth(
        `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
        "post",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as ICustomResponse<string | null>;
        console.log(data);
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Share the Deck");
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Share the Deck");
      });
      toast.success("Deck  Shared");
      deckShareForm.reset();
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to  Share the Deck");
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
            {/* TODO: Combobox for User Selection and Searching */}
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Heart,
  Play,
  Plus,
  EllipsisVertical,
  Pencil,
  Share2,
  Trash2,
  Link2,
  UserCog,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/authProvider"
import { useKeyPress } from "@/hooks/keyPress"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import ConfirmationDialog from "@/components/confirmationDialog"
import UserSearchField from "@/components/userSearchField"
import {
  deckFormSchema,
  deckShareFormSchema,
  deckOwnerFormSchema,
  cardFormSchema
} from "@/types/forms"
import type {
  TDeckFormSchema,
  TDeckShareFormSchema,
  TDeckOwnerFormSchema,
  TCardFormSchema
} from "@/types/forms"
import {
  likeDeck,
  unlikeDeck,
  removeDeck,
  shareDeck,
  changeDeckOwner,
  updateDeck,
  populateDeck,
  sortCards
} from "@/api/deck"
import { createCard } from "@/api/card"
import { LoadingIcon } from "@/components/icons"
import { useFeatures } from "@/contexts/featuresProvider"
import {
  getDeckCardsQueryKey,
  getDeckQueryKey
} from "@/constants"

interface IDeckOptionsProps {
  deckID: string
  dialogOpen: boolean
  setDialogOpen: Dispatch<SetStateAction<boolean>>
}

/**
 * A Button to Play the Deck (navigate to its corresponding Play Page)
 * @param deckID ID of the Deck
 * @param disabled Whether the Button is Disabled or Not
 */
export function DeckPlayButton({
  deckID,
  disabled
}: {
  deckID: string,
  disabled: boolean
}) {
  const navigate = useNavigate()
  return (
    <Button
      onClick={() => navigate(`/play/${deckID}`, { replace: true })}
      type="button"
      title="Play"
      disabled={disabled}
    >
      <Play />
      <span className="select-none">Play</span>
    </Button>
  )
}

/**
 * A Button to Like the Deck
 * @param deckID ID of the Deck
 * @param likes Number of Likes the Deck already has
 * @param isLiked Whether the Deck is liked by the User
 */
export function DeckLikeButton({
  deckID,
  likes,
  isLiked
}: {
  deckID: string,
  likes: number,
  isLiked: boolean
}) {
  const [userLiked, setUserLiked] = useState(isLiked)
  const handleDeckLike = async () => {
    if (userLiked) {
      await unlikeDeck(deckID)
      setUserLiked(false)
    } else {
      await likeDeck(deckID)
      setUserLiked(true)
    }
  }

  return (
    <Button
      onClick={handleDeckLike}
      type="submit"
      title="Like Deck"
      variant="ghost"
    >
      <Heart fill={userLiked ? "currentColor" : "none"} />
      <span className="select-none">
        {likes + (userLiked ? 1 : 0)}
      </span>
    </Button>
  )
}

/**
 * A Dialog for creating a new Card in the Deck
 * @param deckID ID of the Deck
 */
export function CardCreationDialog({
  deckID
}: {
  deckID: string
}) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const cardForm = useForm<TCardFormSchema>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { hint: "" }
  })

  useKeyPress(() => setDialogOpen(true), { code: "KeyN", altKey: true })

  const queryKey = useMemo(() => getDeckCardsQueryKey(deckID), [deckID])
  const cardCreationMutation = useMutation({
    mutationFn: (data: TCardFormSchema) => createCard(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey })
      const cardsPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(
        queryKey,
        (old: ICard[]) => sortCards([...old, data])
      )
      return { cardsPreviously }
    },
    onSuccess: (_, data) => {
      toast.success("Card Created", { description: data.question })
      cardForm.reset()
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.cardsPreviously)
      if (import.meta.env.DEV)
        console.error("An error occurred while creating a Card", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Card")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  })

  function handleCardCreation(values: TCardFormSchema) {
    setDialogOpen(false)
    cardCreationMutation.mutate({ ...values, deck: deckID })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          title="Create Card"
          variant="outline"
          size="icon"
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Card</DialogTitle>
          <DialogDescription>
            Add a new card to the deck
          </DialogDescription>
        </DialogHeader>
        <Form {...cardForm}>
          <form
            className="grid gap-2 py-2"
            onSubmit={cardForm.handleSubmit(handleCardCreation)}
          >
            <FormField
              control={cardForm.control}
              name="question"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Question</FormLabel>
                  <FormControl>
                    <Input className="!mt-0 col-span-3" {...field} />
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
                  <FormControl>
                    <Input className="!mt-0 col-span-3" {...field} />
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
                  <FormControl>
                    <Input className="!mt-0 col-span-3" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                title="Cancel"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                title="Create"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A Dropdown Menu for the Deck Options (Edit, Share, Delete)
 * @param deckID ID of the Deck
 * @param deck information about the Deck
 * @param owner Username of the Deck Owner
 */
export function DeckOptionsDropdown({
  deckID,
  deck,
  owner
}: {
  deckID: string,
  deck: IMoreDeck,
  owner: string
}) {
  const navigate = useNavigate()
  const { user, isUserRateLimited, setLimitedTill } = useAuth()
  const { features } = useFeatures()
  const isUserDeckOwner = user == owner

  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [changeOwnerDialogOpen, setChangeOwnerDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [populatingDeck, setPopulatingDeck] = useState(false)

  const openEditDialog = () => {
    setEditDialogOpen(true)
    setDropdownMenuOpen(false)
  }
  const openShareDialog = () => {
    setShareDialogOpen(true)
    setDropdownMenuOpen(false)
  }
  const openChangeOwnerDialog = () => {
    setChangeOwnerDialogOpen(true)
    setDropdownMenuOpen(false)
  }
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true)
    setDropdownMenuOpen(false)
  }

  useKeyPress(() => setDropdownMenuOpen(true), { code: "Period", altKey: true })
  useKeyPress(openShareDialog, { code: "Backslash", altKey: true })
  useKeyPress(openEditDialog, { code: "F2" })

  const handleDeckPopulate = () => {
    void (async () => {
      toast.info("Populating Deck")
      setPopulatingDeck(true)
      try {
        const res = await populateDeck(deckID)
        if (res instanceof Date) {
          setLimitedTill(res)
          toast.warning("Rate Limited for a few Minutes")
        } else {
          toast.success("Deck Populated")
          await navigate(0)
        }
      } catch (err) {
        if (import.meta.env.DEV)
          console.error("An error occurred while populating the deck", err)
        toast.error("Failed to Populate the Deck")
      }
      setPopulatingDeck(false)
    })()
  }

  const options = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: openEditDialog,
      disabled: !deck.isEditable
    },
    {
      label: "Share",
      icon: Share2,
      onClick: openShareDialog,
      disabled: !isUserDeckOwner
    },
    ...(features.GEN_AI ? [{
      label: "Populate",
      icon: populatingDeck ? LoadingIcon : Sparkles,
      title: isUserRateLimited ? "Can only be done once in a few Minutes" : undefined,
      onClick: handleDeckPopulate,
      disabled: !deck.isEditable || isUserRateLimited || populatingDeck
    }] : []),
    {
      label: "Change Owner",
      icon: UserCog,
      onClick: openChangeOwnerDialog,
      disabled: !isUserDeckOwner
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: openDeleteDialog,
      disabled: !isUserDeckOwner
    }
  ]

  return (
    <>
      <DropdownMenu
        open={dropdownMenuOpen}
        onOpenChange={setDropdownMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            title="Options"
            variant="outline"
            size="icon"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option, idx) => (
            <DropdownMenuItem
              onClick={option.onClick}
              title={option?.title}
              disabled={option.disabled}
              key={idx}
            >
              <option.icon />
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {deck.isEditable && <>
        <DeckEditDialog
          deckID={deckID}
          deck={deck}
          dialogOpen={editDialogOpen}
          setDialogOpen={setEditDialogOpen}
        />
        {isUserDeckOwner && <>
          <DeckShareDialog
            deckID={deckID}
            dialogOpen={shareDialogOpen}
            setDialogOpen={setShareDialogOpen}
          />
          <DeckOwnerChangeDialog
            deckID={deckID}
            dialogOpen={changeOwnerDialogOpen}
            setDialogOpen={setChangeOwnerDialogOpen}
            />
          <DeckDeleteDialog
            deckID={deckID}
            dialogOpen={deleteDialogOpen}
            setDialogOpen={setDeleteDialogOpen}
            />
        </>}
      </>}
    </>
  )
}

/**
 * A Confirmation Dialog for Deleting the Deck
 * @param deckID ID of the Deck
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 */
function DeckDeleteDialog({
  deckID,
  dialogOpen,
  setDialogOpen
}: IDeckOptionsProps) {
  const navigate = useNavigate()
  function handleDeckDeletion() {
    void (async () => {
      try {
        await removeDeck(deckID)
        toast.info("Deck Deleted")
        await navigate("/dashboard", { replace: true })
      } catch (err) {
        if (import.meta.env.DEV)
          console.error("An error occurred while deleting the deck", err)
        toast.error("Failed to Delete Deck")
      }
    })()
  }

  return (
    <ConfirmationDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onConfirm={handleDeckDeletion}
      dialogMessage="This action cannot be undone. This will permanently delete the deck and remove all the cards present in it."
      confirmButtonTitle="Delete"
    />
  )
}

/**
 * A Dialog for Editing the Deck
 * @param deckID ID of the Deck
 * @param deck information about the Deck
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 * @returns
 */
function DeckEditDialog({
  deckID,
  deck,
  dialogOpen,
  setDialogOpen
}: {
  deckID: string,
  deck: IMoreDeck,
  dialogOpen: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()
  const deckForm = useForm<TDeckFormSchema>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description,
      isPrivate: deck.isPrivate,
    },
  })

  const queryKey = getDeckQueryKey(deckID)
  const deckEditingMutation = useMutation({
    mutationFn: ({ deckID, values }: {
      deckID: string, values: TDeckFormSchema
    }) => updateDeck(deckID, values),
    onMutate: async ({ values }) => {
      await queryClient.cancelQueries({ queryKey })
      const deckPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, values)
      return { deckPreviously }
    },
    onSuccess: () => {
      toast.success("Deck Edited")
      deckForm.reset()
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.deckPreviously)
      if (import.meta.env.DEV)
        console.error("An error occurred while editing the deck", err)
      toast.error("Failed to Edit the Deck")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  function handleDeckEditing(values: TDeckFormSchema) {
    setDialogOpen(false)
    deckEditingMutation.mutate({ deckID, values })
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
                  <FormControl>
                    <Input className="!mt-0 col-span-3" {...field} />
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
                  <FormControl>
                    <Textarea className="!mt-0 col-span-3" placeholder="My New Deck" {...field} />
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
                  <FormControl>
                    <Switch
                    className="!mt-0 col-span-3"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="reset"
                title="Reset"
                variant="ghost"
                onClick={() => deckForm.reset()}
              >
                Reset
              </Button>
              <Button
                type="button"
                title="Cancel"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                title="Edit"
              >
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A Dialog for Sharing/Unsharing the Deck
 * @param deckID ID of the Deck
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 * @returns
 */
function DeckShareDialog({
  deckID,
  dialogOpen,
  setDialogOpen
}: IDeckOptionsProps) {
  const deckShareForm = useForm<TDeckShareFormSchema>({
    resolver: zodResolver(deckShareFormSchema),
    defaultValues: {
      isEditable: false,
      unshare: false,
    },
  })

  const handleUserSelection = (user: IUserWithID) => {
    deckShareForm.setValue("user", user._id)
  }
  const handleLinkCopy = () => {
    void navigator.clipboard.writeText(`${import.meta.env.VITE_CLIENT_HOST}/deck/${deckID}`)
    toast.info("Link Copied")
  }
  const handleShareCancel = () => setDialogOpen(false)

  async function handleDeckSharing(values: TDeckShareFormSchema) {
    setDialogOpen(false)
    try {
      await shareDeck(deckID, values)
      toast.success("Deck Shared")
      deckShareForm.reset()
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("An error occurred while sharing the deck", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Share the Deck")
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
                  <UserSearchField value={field.value} onSelect={handleUserSelection} />
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
                  <FormControl>
                    <Switch
                      className="!mt-0 col-span-3"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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
                  <FormControl>
                    <Switch
                      className="!mt-0 col-span-3"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                title="Link"
                variant="ghost"
                onClick={handleLinkCopy}
              >
                <Link2 />
              </Button>
              <Button
                type="button"
                title="Cancel"
                variant="outline"
                onClick={handleShareCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                title="Edit"
              >
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A Dialog for changing the Owner of the Deck
 * @param deckID ID of the Deck
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 */
function DeckOwnerChangeDialog({
  deckID,
  dialogOpen,
  setDialogOpen
}: IDeckOptionsProps) {
  const navigate = useNavigate()
  const deckOwnerChangeForm = useForm<TDeckOwnerFormSchema>({
    resolver: zodResolver(deckOwnerFormSchema),
  })

  const handleUserSelection = (user: IUserWithID) => {
    deckOwnerChangeForm.setValue("user", user._id)
  }

  async function handleDeckSharing(values: TDeckOwnerFormSchema) {
    setDialogOpen(false)
    try {
      await changeDeckOwner(deckID, values)
      toast.success("Deck Owner Changed")
      deckOwnerChangeForm.reset()
      await navigate("/dashboard", { replace: true })
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("An error occurred while changing the deck's owner", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Change the Deck's Owner")
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Deck Owner</DialogTitle>
          <DialogDescription>
            Change the Owner of the Deck. Making this change will remove your access from the Deck, unless shared by the new Owner.
          </DialogDescription>
        </DialogHeader>
        <Form {...deckOwnerChangeForm}>
          <form className="grid gap-2" onSubmit={deckOwnerChangeForm.handleSubmit(handleDeckSharing)}>
            <FormField
              control={deckOwnerChangeForm.control}
              name="user"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">New Owner</FormLabel>
                  <UserSearchField value={field.value} onSelect={handleUserSelection} />
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)} type="button" title="Cancel" variant="outline">Cancel</Button>
              <Button type="submit" title="Change Owner" variant="destructive">Change Owner</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

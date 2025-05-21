/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useKeyPress } from "@/hooks/keyPress"
import {
  Dialog,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { deckFormSchema, cardFormSchema } from "@/types/forms"
import type { TDeckFormSchema, TCardFormSchema } from "@/types/forms"
import {
  createDeck,
  isDeckUncategorised,
  sortCards,
  sortDecks
} from "@/api/deck"
import { createCard } from "@/api/card"
import { getAllDecksQueryKey, getDeckCardsQueryKey } from "@/constants"

/**
 * A Dropdown Menu that allows the User to create a new Deck or Card
 * @param decks Decks owned or editable by the User
 */
export function CreationMenu({ decks }: { decks: ILessDeck[] }) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false)
  const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false)
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false)

  const openDeckDialog = () => {
    setIsDeckDialogOpen(true)
    setIsDropdownMenuOpen(false)
  }
  const openCardDialog = () => {
    setIsCardDialogOpen(true)
    setIsDropdownMenuOpen(false)
  }

  useKeyPress(() => setIsDropdownMenuOpen(true), { code: "Period", altKey: true })
  useKeyPress(openDeckDialog, { code: "KeyS", altKey: true })
  useKeyPress(openCardDialog, { code: "KeyK", altKey: true })

  return (
    <>
      <DropdownMenu open={isDropdownMenuOpen} onOpenChange={setIsDropdownMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" title="Creation Menu" variant="outline" size="icon"><Plus /></Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openDeckDialog}>Deck</DropdownMenuItem>
          <DropdownMenuItem onClick={openCardDialog}>Card</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeckCreationDialog dialogOpen={isDeckDialogOpen} setDialogOpen={setIsDeckDialogOpen} />
      <CardCreationDialog dialogOpen={isCardDialogOpen} setDialogOpen={setIsCardDialogOpen} decks={decks} />
    </>
  )
}

/**
 * A Dialog for creating a new Deck
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 */
function DeckCreationDialog({
  dialogOpen,
  setDialogOpen
}: {
  dialogOpen: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()
  const deckForm = useForm<TDeckFormSchema>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      description: "",
      isPrivate: true,
    },
  })

  const queryKey = useMemo(getAllDecksQueryKey, [])
  const deckCreationMutation = useMutation({
    mutationFn: (data: TDeckFormSchema) => createDeck(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey })
      const decksPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(
        queryKey,
        (old: ILessDeck[]) => sortDecks([
          ...old,
          {...data, dateUpdated: new Date().toISOString() }
        ])
      )
      return { decksPreviously }
    },
    onSuccess: (_, data) => {
      toast.success("Deck Created", { description: data.name })
      deckForm.reset()
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.decksPreviously)
      if (import.meta.env.DEV)
        console.error("An error occurred while creating a deck", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Deck")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  })

  const handleDeckCreation = (values: TDeckFormSchema) => {
    setDialogOpen(false)
    deckCreationMutation.mutate(values)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Deck</DialogTitle>
          <DialogDescription>
            Add a new Deck to your Profile. It can store a collection of Cards.
          </DialogDescription>
        </DialogHeader>
        <Form {...deckForm}>
          <form className="grid gap-2" onSubmit={deckForm.handleSubmit(handleDeckCreation)}>
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
                    <Switch className="!mt-0 col-span-3" checked={field.value} onCheckedChange={field.onChange} />
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
  )
}

/**
 * A Dialog for creating a new Card
 * @param decks Decks to which the Card can be added
 * @param dialogOpen Whether the dialog is Open or not
 * @param setDialogOpen Function to set the Dialog Open or Closed
 */
function CardCreationDialog({
  decks,
  dialogOpen,
  setDialogOpen
}: {
  decks: ILessDeck[],
  dialogOpen: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()
  const cardForm = useForm<TCardFormSchema>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      hint: "",
      deck: "",
    },
  })

  const cardCreationMutation = useMutation({
    mutationFn: (data: TCardFormSchema) => createCard(data),
    onMutate: async (data) => {
      const queryKey = getDeckCardsQueryKey(data.deck!)
      await queryClient.cancelQueries({ queryKey })
      const cardsPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(
        queryKey,
        (old?: ICard[]) => sortCards([...(old ?? []), data])
      )
      return { queryKey, cardsPreviously }
    },
    onSuccess: (_, data) => {
      toast.success("Card Created", { description: data.question })
      cardForm.reset()
    },
    onError: (err, _, ctx) => {
      if (ctx)
        queryClient.setQueryData(
          ctx.queryKey,
          ctx.cardsPreviously
        )
      if (import.meta.env.DEV)
        console.error("An error occurred while creating a Card", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Card")
    },
    onSettled: (_, __, data) => queryClient.invalidateQueries({
      queryKey: getDeckCardsQueryKey(data.deck!)
    }),
  })

  function handleCardCreation(values: TCardFormSchema) {
    setDialogOpen(false)
    cardCreationMutation.mutate(values)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Card</DialogTitle>
          <DialogDescription>
            Make a new Card in your Collection. Adding to a Deck is optional.
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
            <FormField
              control={cardForm.control}
              name="deck"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Deck</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="!mt-0 col-span-3">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {decks.map((deck, idx) => isDeckUncategorised(deck) ? "" : (
                        <SelectItem key={idx} value={deck._id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
  )
}

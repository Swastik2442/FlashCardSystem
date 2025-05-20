import { useState, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Pencil, Trash2, SparkleIcon, SparklesIcon } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ConfirmationDialog from "@/components/confirmationDialog"
import { LoadingIcon } from "@/components/icons"
import { updateCard, removeCard, populateCard } from "@/api/card"
import { cardFormSchema } from "@/types/forms"
import type { TCardFormSchema } from "@/types/forms"
import { useAuth } from "@/contexts/authProvider"
import { useFeatures } from "@/contexts/featuresProvider"
import { isDeckUncategorised, sortCards } from "@/api/deck"
import {
  useAllDecksQuery,
  useDeckCardsQuery
} from "@/hooks/deckQueries"
import { getDeckCardsQueryKey } from "@/constants"

const defaultCard: ICard = {
  _id: "",
  question: "",
  answer: "",
  hint: "",
  deck: "",
}

/**
 * A Component to render Cards in an Grid Format, along with Editing and Deletion options.
 * @param deckID - ID of the Deck whose Cards are to be rendered
 * @param editable - Whether the Cards are Editable or Not
 */
function ShowCards({
  deckID,
  editable = false,
}: {
  deckID: string,
  editable?: boolean,
}) {
  const queryClient = useQueryClient()
  const cardsQuery = useDeckCardsQuery(deckID)

  const { setLimitedTill } = useAuth()

  const [cardToEdit, setCardToEdit] = useState<ICard | null>(null)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const cardForm = useForm({
    resolver: zodResolver(cardFormSchema),
    defaultValues: useMemo(() => cardToEdit ?? defaultCard, [cardToEdit])
  })

  function selectCardToEdit(card: ICard) {
    setCardToEdit(card)
    cardForm.reset(card)
    setEditDialogOpen(true)
  }
  function selectCardToDelete(cardID: string) {
    setCardToDelete(cardID)
    setDeleteDialogOpen(true)
  }

  const queryKey = useMemo(() => getDeckCardsQueryKey(deckID), [deckID]);
  const cardEditMutation = useMutation({
    mutationFn: ({ cardID, values }: {
      cardID: string, values: TCardFormSchema
    }) => updateCard(cardID, values),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey })
      const cardsPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(
        queryKey,
        (old: ICard[]) => sortCards([
          ...(old.filter(v => v._id != data.cardID)),
          data.values
        ])
      )
      return { cardsPreviously }
    },
    onSuccess: (_, data) => {
      setCardToEdit(null)
      toast.success("Card Edited", { description: data.values.question })
      cardForm.reset()
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.cardsPreviously)
      if (import.meta.env.NODE_ENV == "development")
        console.error("An error occurred while editing the card", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Edit the Card")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
  const cardDeleteMutation = useMutation({
    mutationFn: (cardID: string) => removeCard(cardID),
    onMutate: async (cardID) => {
      await queryClient.cancelQueries({ queryKey })
      const cardsPreviously = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(
        queryKey,
        (old: ICard[]) => old.filter(v => v._id != cardID)
      )
      return { cardsPreviously }
    },
    onSuccess: () => {
      setCardToDelete(null)
      toast.info("Card Deleted")
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.cardsPreviously)
      if (import.meta.env.NODE_ENV == "development")
        console.error("An error occurred while deleting the card", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Delete the Card")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
  const cardPopulationMutation = useMutation({
    mutationFn: (cardID: string) => populateCard(cardID),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const cardsPreviously = queryClient.getQueryData(queryKey)
      return { cardsPreviously }
    },
    onSuccess: (data, cardID) => {
      if (data instanceof Date || typeof data == "string") {
        setLimitedTill(
          (data instanceof Date)
          ? data
          : (new Date(new Date().getTime() + 1800000)) // 30 Minutes
        )
        toast.warning("Rate Limited for a few Minutes")
      } else {
        cardForm.setValue("question", data.question, { shouldDirty: true })
        cardForm.setValue("answer", data.answer, { shouldDirty: true })
        cardForm.setValue("hint", data.hint, { shouldDirty: true })
        toast.success("Card Populated")

        queryClient.setQueryData(
          queryKey,
          (old: ICard[]) => sortCards([
            ...(old.filter(v => v._id != cardID)),
            data
          ])
        )
      }
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.cardsPreviously)
      if (import.meta.env.NODE_ENV == "development")
        console.error("An error occurred while populating the card", err)
      toast.error("Failed to Populate the Card")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  function handleCardEditing(values: TCardFormSchema) {
    setEditDialogOpen(false)
    if (!cardToEdit) return
    cardEditMutation.mutate({ cardID: cardToEdit._id, values })
  }
  function handleCardDeletion() {
    setDeleteDialogOpen(false)
    if (!cardToDelete) return
    cardDeleteMutation.mutate(cardToDelete)
  }
  function handleCardPopulation() {
    if (!cardToEdit) return
    cardPopulationMutation.mutate(cardToEdit._id)
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        className="flex flex-wrap gap-4 mx-8"
      >
        {cardsQuery.data?.map((card, idx) => (
          <Card
            className="min-w-72 flex-1 flex flex-col justify-between group"
            key={idx}
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => editable && selectCardToEdit(card)}
            >
              <CardTitle className="font-normal">{card.question}</CardTitle>
            </CardHeader>
            {editable && <CardFooter
              className="flex justify-end gap-2 invisible group-hover:visible"
            >
              <button
                className="text-accent-foreground"
                type="button"
                title="Delete Card"
                onClick={() => selectCardToDelete(card._id)}
              >
                <Trash2 className="size-4" />
              </button>
              <button
                className="text-accent-foreground"
                type="button"
                title="Edit Card"
                onClick={() => selectCardToEdit(card)}
              >
                <Pencil className="size-4" />
              </button>
            </CardFooter>}
          </Card>
        ))}
      </motion.div>
      {editable && <>
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleCardDeletion}
          confirmButtonTitle="Delete"
          dialogMessage="This action cannot be undone. This will permanently delete the card from the servers."
        />
        <CardEditDialog
          dialogOpen={editDialogOpen}
          setDialogOpen={setEditDialogOpen}
          cardForm={cardForm}
          handleCardEditing={handleCardEditing}
          handleCardPopulation={handleCardPopulation}
        />
      </>}
    </div>
  )
}

/**
 * A Dialog to Edit a Card, with Fields for Question, Answer, Hint and Deck.
 * @param dialogOpen - Whether the Dialog is Open or not
 * @param setDialogOpen - Function to set the Dialog Open or Closed
 * @param cardForm - `react-hook-form` Form to be used for Editing the Card
 * @param handleCardEditing - Function to be called when the Card is Edited
 * @param handleCardPopulation - Function to be called when the Card is to be Populated
 */
function CardEditDialog({
  dialogOpen,
  setDialogOpen,
  cardForm,
  handleCardEditing,
  handleCardPopulation
}: {
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  cardForm: UseFormReturn<ICard, unknown, ICard>,
  handleCardEditing: (values: ICard) => void
  handleCardPopulation: () => void
}) {
  const { limitedTill } = useAuth()
  const isUserRatelimited = limitedTill instanceof Date && new Date() < limitedTill

  const { features } = useFeatures()
  const decksQuery = useAllDecksQuery()

  const [populatingCard, setPopulatingCard] = useState(false)
  function onCardPopulation() {
    toast.info("Populating Card")
    setPopulatingCard(true)
    handleCardPopulation()
    setPopulatingCard(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Edit the Details of the Card. Setting the Deck as None removes the Card from all Decks.
          </DialogDescription>
        </DialogHeader>
        <Form {...cardForm}>
          <form
            className="grid gap-2 py-2"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={cardForm.handleSubmit(handleCardEditing)}
          >
            <FormField
              control={cardForm.control}
              name="question"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Question</FormLabel>
                  <FormControl>
                    <Input className="!mt-0 col-span-3" {...field} disabled={populatingCard} />
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
                    <Input className="!mt-0 col-span-3" {...field} disabled={populatingCard} />
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
                    <Input className="!mt-0 col-span-3" {...field} disabled={populatingCard} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={populatingCard}>
                    <FormControl>
                      <SelectTrigger className ="!mt-0 col-span-3">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {decksQuery.data?.map((deck, idx) => (
                        <SelectItem key={idx} value={deck._id}>
                          {isDeckUncategorised(deck) ? <>&nbsp;</> : deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              {features.GEN_AI && <Button
                type="button"
                title={
                  isUserRatelimited
                  ? "Can only be done once in a few Minutes"
                  : "Populate Card"
                }
                variant="ghost"
                className="group sm:mr-auto"
                onClick={onCardPopulation}
                disabled={populatingCard || isUserRatelimited}
              >
                {populatingCard ? <LoadingIcon /> : <>
                  <SparklesIcon className="size-4 group-hover:hidden" />
                  <SparkleIcon className="size-4 hidden group-hover:block" />
                </>}
              </Button>}
              <Button
                type="button"
                title="Cancel"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                title="Reset"
                variant="secondary"
                onClick={() => cardForm.reset()}
                disabled={populatingCard}
              >
                Reset
              </Button>
              <Button
                type="submit"
                title={cardForm.formState.isDirty ? "Save" : "Edit"}
                disabled={populatingCard}
              >
                {cardForm.formState.isDirty ? "Save" : "Edit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ShowCards

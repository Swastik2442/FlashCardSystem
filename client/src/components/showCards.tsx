/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { updateCard, removeCard, populateCard } from "@/api/card"
import { cardFormSchema } from "@/types/forms"
import type { TCardFormSchema } from "@/types/forms"
import { useAuth } from "@/contexts/authProvider"
import { useFeatures } from "@/contexts/featuresProvider"
import { LoadingIcon } from "./icons"
import { isDeckUncategorised } from "@/api/deck"
import { useAllDecksQuery, useDeckCardsQuery } from "@/queries/decks"

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

  async function handleCardEditing(values: TCardFormSchema) {
    setEditDialogOpen(false)
    if (!cardToEdit)
      return

    try {
      await updateCard(cardToEdit._id, values)
      setCardToEdit(null)
      toast.success("Card Edited", { description: values.question })
      cardForm.reset()
      uponChange()
    } catch (err) {
      console.error(err)
      toast.error((err instanceof Error) ? err.message : "Failed to Edit the Card")
    }
  }
  function handleCardDeletion() {
    setDeleteDialogOpen(false)
    if (!cardToDelete)
      return

    void (async () => {
      try {
        await removeCard(cardToDelete)
        setCardToDelete(null)
        toast.info("Card Deleted")
        uponChange()
      } catch (err) {
        console.error(err)
        toast.error((err instanceof Error) ? err.message : "Failed to Delete the Card")
      }
    })()
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
 */
function CardEditDialog({
  dialogOpen,
  setDialogOpen,
  cardForm,
  handleCardEditing
}: {
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  cardForm: UseFormReturn<ICard, unknown, ICard>,
  handleCardEditing: (values: ICard) => Promise<void>
}) {
  const { limitedTill, setLimitedTill } = useAuth()
  const { features } = useFeatures()
  const decksQuery = useAllDecksQuery()

  const [populatingCard, setPopulatingCard] = useState(false)
  const isUserRatelimited = limitedTill instanceof Date && new Date() < limitedTill

  function handleCardPopulation() {
    void (async () => {
      toast.info("Populating Card")
      setPopulatingCard(true)
      try {
        const res = await populateCard(cardForm.getValues("_id"))
        if (res instanceof Date || typeof res == "string") {
          setLimitedTill(
            (res instanceof Date)
            ? res
            : (new Date(new Date().getTime() + 1800000)) // 30 Minutes
          )
          toast.warning("Rate Limited for a few Minutes")
        } else {
          cardForm.setValue("question", res.question, { shouldDirty: true })
          cardForm.setValue("answer", res.answer, { shouldDirty: true })
          cardForm.setValue("hint", res.hint, { shouldDirty: true })
          toast.success("Card Populated")
        }
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Failed to Populate the Card")
        toast.error("Failed to Populate the Card")
      }
      setPopulatingCard(false)
    })()
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
            onSubmit={cardForm.handleSubmit(handleCardEditing)}
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
            <FormField
              control={cardForm.control}
              name="deck"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Deck</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className ="!mt-0 col-span-3">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {decksQuery.data?.map((deck, idx) => (
                        <SelectItem key={idx} value={deck._id}>
                          {isDeckUncategorised(deck) ? "&nbsp" : deck.name}
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
                onClick={handleCardPopulation}
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
              >
                Reset
              </Button>
              <Button
                type="submit"
                title={cardForm.formState.isDirty ? "Save" : "Edit"}
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

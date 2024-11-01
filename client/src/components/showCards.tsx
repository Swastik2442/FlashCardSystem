/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmationDialog from "@/components/confirmationDialog";
import { updateCard, removeCard } from "@/api/card";
import { cardFormSchema } from "@/types/forms";
import type { TCardFormSchema } from "@/types/forms";

const defaultCard: ICard = {
  _id: "",
  question: "",
  answer: "",
  hint: "",
  deck: "",
};

function ShowCards({ decks, cards, uncategorizedDeck, uponChange }: { decks: ILessDeck[], cards: ICard[], uncategorizedDeck: ILessDeck, uponChange: () => void }) {
  const [cardToEdit, setCardToEdit] = useState<ICard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  defaultCard.deck = uncategorizedDeck._id;
  const cardForm = useForm({
    resolver: zodResolver(cardFormSchema),
    defaultValues: useMemo(() => cardToEdit ?? defaultCard, [cardToEdit]),
  });

  function selectCardToEdit(card: ICard) {
    setCardToEdit(card);
    cardForm.reset(card);
    setEditDialogOpen(true);
  }
  function selectCardToDelete(cardID: string) {
    setCardToDelete(cardID);
    setDeleteDialogOpen(true);
  }

  async function handleCardEditing(values: TCardFormSchema) {
    setEditDialogOpen(false);
    if (!cardToEdit)
      return;

    try {
      await updateCard(cardToEdit._id, values);
      setCardToEdit(null);
      toast.success("Card Edited", { description: values.question });
      cardForm.reset();
      uponChange();
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Edit the Card");
    }
  }
  function handleCardDeletion() {
    setDeleteDialogOpen(false);
    if (!cardToDelete)
      return;
  
    void (async () => {
      try {
        await removeCard(cardToDelete);
        setCardToDelete(null);
        toast.info("Card Deleted");
        uponChange();
      } catch (err) {
        console.error(err);
        toast.error((err instanceof Error) ? err.message : "Failed to Delete the Card");
      }
    })();
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 mx-8">
        {cards.map((card, idx) => (
          <Card className="min-w-72 flex-1" key={10000 + idx}>
            <CardHeader>
              <CardTitle>{card.question}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <button className="text-accent-foreground" type="button" title="Delete Card" onClick={() => selectCardToDelete(card._id)}>
                <Trash2 className="size-4" />
              </button>
              <button className="text-accent-foreground" type="button" title="Edit Card" onClick={() => selectCardToEdit(card)}>
                <Pencil className="size-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleCardDeletion} confirmButtonTitle="Delete" dialogMessage="This action cannot be undone. This will permanently delete the card from the servers." />
      <CardEditDialog dialogOpen={editDialogOpen} setDialogOpen={setEditDialogOpen} cardForm={cardForm} handleCardEditing={handleCardEditing} decks={decks} uncategorizedDeck={uncategorizedDeck} />
    </>
  )
}

function CardEditDialog({ dialogOpen, setDialogOpen, cardForm, handleCardEditing, decks, uncategorizedDeck }: { dialogOpen: boolean, setDialogOpen: (open: boolean) => void, cardForm: UseFormReturn<ICard, unknown, undefined>, handleCardEditing: (values: ICard) => Promise<void>, decks: ILessDeck[], uncategorizedDeck: ILessDeck }) {
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
          <form className="grid gap-2 py-2" onSubmit={cardForm.handleSubmit(handleCardEditing)}>
            <FormField
              control={cardForm.control}
              name="question"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-2 min-h-9">
                  <FormLabel className="text-right">Question</FormLabel>
                  <FormControl style={{marginTop: 0 + 'px'}}>
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
                  <FormControl style={{marginTop: 0 + 'px'}}>
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
                  <FormControl style={{marginTop: 0 + 'px'}}>
                    <Input className="col-span-3" {...field} />
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
                    <FormControl style={{marginTop: 0 + 'px'}}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={uncategorizedDeck._id}>&nbsp;</SelectItem>
                      {decks.map((deck, idx) => (
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
              <Button type="button" title="Cancel" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="button" title="Reset" variant="secondary" onClick={() => cardForm.reset()}>Reset</Button>
              <Button type="submit" title="Edit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ShowCards;

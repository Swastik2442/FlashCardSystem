/* eslint-disable @typescript-eslint/no-misused-promises */
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// TODO: Implement a way to add newly created decks/cards to page without full reload

type CreationResponse = ICustomResponse<string | null>;

const deckFormSchema = z.object({
  name: z.string()
  .min(3, { message: "Name must be at least 3 characters." })
  .max(64, { message: "Name must be at most 64 characters." }),
  description: z.string()
  .max(256, { message: "Description must be at most 256 characters." }),
  isPrivate: z.boolean().default(true).optional(),
});

const cardFormSchema = z.object({
  question: z.string()
  .min(3, { message: "Question must be at least 3 characters." })
  .max(64, { message: "Question must be at most 128 characters." }),
  answer: z.string()
  .min(3, { message: "Answer must be at least 3 characters." })
  .max(64, { message: "Answer must be at most 128 characters." }),
  hint: z.string()
  .max(64, { message: "Hint must be at most 64 characters." }),
  deck: z.string(),
});

export default function CreationMenu() {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  const openDeckDialog = () => {
    setIsDeckDialogOpen(true);
    setIsDropdownMenuOpen(false);
  };
  const openCardDialog = () => {
    setIsCardDialogOpen(true);
    setIsDropdownMenuOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isDropdownMenuOpen} onOpenChange={setIsDropdownMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon"><Plus /></Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={openDeckDialog}>Deck</DropdownMenuItem>
          <DropdownMenuItem onClick={openCardDialog}>Card</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeckCreationDialog dialogOpen={isDeckDialogOpen} setDialogOpen={setIsDeckDialogOpen} />
      <CardCreationDialog dialogOpen={isCardDialogOpen} setDialogOpen={setIsCardDialogOpen} />
    </>
  );
}

function DeckCreationDialog({ dialogOpen, setDialogOpen }: { dialogOpen: boolean, setDialogOpen: Dispatch<SetStateAction<boolean>> }) {
  const navigate = useNavigate();
  const deckForm = useForm<z.infer<typeof deckFormSchema>>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      description: "",
      isPrivate: true,
    },
  });

  async function handleDeckCreation(values: z.infer<typeof deckFormSchema>) {
    setDialogOpen(false);
    try {
      await fetchWithAuth(
        "http://localhost:2442/deck/new",
        "post",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as CreationResponse;
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Create a Deck");
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Create a Deck");
      });
      toast.success("Deck Created", { description: values.name });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Deck");
    }
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
                  <FormControl style={{marginTop: 0 + 'px'}}>
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
                  <FormControl style={{marginTop: 0 + 'px'}}>
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
                  <FormControl style={{marginTop: 0 + 'px'}}>
                    <Switch className="col-span-3" checked={field.value} onCheckedChange={field.onChange} />
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

function CardCreationDialog({ dialogOpen, setDialogOpen }: { dialogOpen: boolean, setDialogOpen: Dispatch<SetStateAction<boolean>> }) {
  const navigate = useNavigate();
  const cardForm = useForm<z.infer<typeof cardFormSchema>>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      hint: "",
      deck: "",
    },
  })

  async function handleCardCreation(values: z.infer<typeof cardFormSchema>) {
    setDialogOpen(false);
    try {
      await fetchWithAuth(
        "http://localhost:2442/card/new",
        "post",
        JSON.stringify(values),
      ).then(async (res) => {
        const data = await res.json() as CreationResponse;
        if (!res?.ok)
          throw new Error(data?.message || "Failed to Create a Card");
        console.log(data);
      }).catch((err: Error) => {
        throw new Error(err?.message || "Failed to Create a Card");
      });
      navigate("/dashboard", { replace: true });
      toast.success("Card Created", { description: values.question });
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Create a Deck");
    }
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
                      <SelectItem value="m@example.com">m@example.com</SelectItem>
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">m@support.com</SelectItem>
                    </SelectContent>
                  </Select>
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

/* eslint-disable @typescript-eslint/no-misused-promises */
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

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
  const [isCardOpen, setIsCardDialogOpen] = useState(false);

  const openDeckDialog = () => {
    setIsDeckDialogOpen(true);
    setIsDropdownMenuOpen(false);
  };
  const openCardDialog = () => {
    setIsCardDialogOpen(true);
    setIsDropdownMenuOpen(false);
  };

  const deckForm = useForm<z.infer<typeof deckFormSchema>>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      description: "",
      isPrivate: true,
    },
  });

  const cardForm = useForm<z.infer<typeof cardFormSchema>>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      hint: "",
      deck: "",
    },
  })

  function handleDeckCreation(values: z.infer<typeof deckFormSchema>) {
    setIsDeckDialogOpen(false);

    toast.success("Deck Created", { description: `${values.name} ${values.description} ${values.isPrivate}` });
  }
  function handleCardCreation(values: z.infer<typeof cardFormSchema>) {
    setIsCardDialogOpen(false);

    toast.success("Card Created", { description: `${values.question} ${values.answer} ${values.hint} ${values.deck}` });
  }

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

      <Dialog open={isDeckDialogOpen} onOpenChange={setIsDeckDialogOpen}>
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

      <Dialog open={isCardOpen} onOpenChange={setIsCardDialogOpen}>
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
    </>
  );
}

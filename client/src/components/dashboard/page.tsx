import { useState } from "react";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFormattedDate } from "@/utils/time";
import CreationMenu from "./options";
import ConfirmationDialog from "../confirmationDialog";

interface ICardWithID extends ICard {
  _id: string;
}

interface IDashboardLoaderData {
  decks: ILessDeck[];
  cards: ICardWithID[];
}

export async function DashboardLoader(): Promise<IDashboardLoaderData> {
  // Get all Decks owned by or shared to the User
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/deck/all`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err.message || "Failed to fetch decks");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch decks");

  const allDecksData = await res.json() as ICustomResponse<ILessDeck[]>;
  const uncat = allDecksData.data.find((deck) => deck.name === "#UNCATEGORISED#");
  const decks = allDecksData.data.filter((deck) => deck.name !== "#UNCATEGORISED#");
  if (!uncat)
    return { decks: decks, cards: [] };

  // Get all Cards in the Uncategorized Deck
  const uncatRes = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${uncat._id}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch uncategorized cards");
  });
  if (!uncatRes?.ok)
    return { decks: decks, cards: [] };

  // Organize the data
  const uncatCardsData = await uncatRes.json() as ICustomResponse<IMoreDeck>;
  const cards: ICardWithID[] = [];
  for  (const cardID of uncatCardsData.data.cards) {
    const cardRes = await fetchWithAuth(
      `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
      "get"
    ).catch((err: Error) => {
      console.error(err.message || "Failed to fetch card");
    });
    if (!cardRes?.ok)
      continue;

    const cardData = await cardRes.json() as ICustomResponse<ICard>;
    cards.push({ ...(cardData.data), _id: cardID });
  }
  decks.sort((a, b) => (a.dateUpdated > b.dateUpdated || a.name < b.name) ? -1 : 1);
  cards.sort((a, b) => a.question > b.question ? 1 : -1);

  return { decks: decks, cards: cards };
}

export function Dashboard() {
  const { decks, cards } = useLoaderData() as IDashboardLoaderData;
  const [cardDeleteDialogOpen, setCardDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleCardSelection(cardID: string) {
    setCardToDelete(cardID);
    setCardDeleteDialogOpen(true);
  }

  function handleCardDeletion() {
    setCardDeleteDialogOpen(false);
    if (!cardToDelete)
      return;

    fetchWithAuth(
      `${import.meta.env.VITE_SERVER_HOST}/card/${cardToDelete}`,
      "delete"
    ).then((res) => {
      if (!res.ok)
        throw new Error("Failed to delete card");

      toast.info("Card Deleted");
      navigate("/dashboard", { replace: true });
    }).catch((err: Error) => {
      console.error(err.message || "Failed to delete card");
      toast.error("Failed to delete deck");
    });
  }

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">Dashboard</h1>
        <div className="flex gap-1">
          <CreationMenu decks={decks} />
          <Button variant="outline" size="icon">
            <Trash2/>
          </Button>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex flex-wrap gap-4 mx-8">
        {decks.length === 0 && cards.length === 0 && (
          <div className="text-center w-full h-full">
          <span className="font-thin">No Decks or Cards found</span>
          <h2>
            <span>Start creating them using the</span>
            <Plus className="inline-block size-4 m-1 mb-2" />
            <span>Icon in the Top-Right Corner.</span>
          </h2>
        </div>
        )}
        {decks.map((deck, idx) => (
          <Card className="min-w-72 flex-1" key={idx}>
            <Link to={`/deck/${deck._id}`}>
              <CardHeader>
                <CardTitle>{deck.name}</CardTitle>
              </CardHeader>
            </Link>
            <CardFooter className="flex justify-between">
              <span className="text-sm font-light">{getFormattedDate(deck.dateUpdated)}</span>
              <span>{deck.isPrivate ? <Lock className="size-4" /> : ""}</span>
            </CardFooter>
          </Card>
        ))}
        {cards.map((card, idx) => (
          <Card className="min-w-72 flex-1" key={10000+idx}>
            <CardHeader>
              <CardTitle>{card.question}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <button className="sm:text-foreground/0 hover:text-accent-foreground transition-colors ease-in delay-150" type="button" onClick={() => handleCardSelection(card._id)}>
                <Trash2 className="size-4" />
              </button>
              <button className="sm:text-foreground/0 hover:text-accent-foreground transition-colors ease-in delay-150" type="button">
                <Pencil className="size-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <ConfirmationDialog open={cardDeleteDialogOpen} onOpenChange={setCardDeleteDialogOpen} onConfirm={handleCardDeletion} confirmButtonTitle="Delete" dialogMessage="This action cannot be undone. This will permanently delete the card from the servers." />
    </div>
  );
}

export default Dashboard;

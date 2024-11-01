import { useNavigate, useLoaderData, Link } from "react-router-dom";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShowCards from "@/components/showCards";
import { getFormattedDate } from "@/utils/time";
import { CreationMenu } from "./options";
import { isDeckUncategorized, getAllDecks, getDeckCards } from "@/api/deck";

interface IDashboardLoaderData {
  decks: ILessDeck[];
  cards: ICard[];
  uncategorizedDeck: ILessDeck;
}

export async function DashboardLoader(): Promise<IDashboardLoaderData> {
  const allDecks = await getAllDecks();
  const decks = allDecks.filter((deck) => !isDeckUncategorized(deck));
  decks.sort((a, b) => (a.dateUpdated > b.dateUpdated || a.name < b.name) ? -1 : 1);

  const uncat = allDecks.find(isDeckUncategorized);
  const cards = uncat ? await getDeckCards(uncat._id) : [];
  cards.sort((a, b) => a.question > b.question ? 1 : -1);

  localStorage.setItem("fcs-decks", JSON.stringify(allDecks));
  localStorage.setItem("fcs-uncatcards", JSON.stringify(cards));

  return { decks: decks, cards: cards, uncategorizedDeck: uncat ?? { _id: "", name: "#UNCATEGORISED#", isPrivate: true, dateUpdated: "" } };
}

export function Dashboard() {
  const { decks, cards, uncategorizedDeck } = useLoaderData() as IDashboardLoaderData;
  const navigate = useNavigate();

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">Dashboard</h1>
        <div className="flex gap-1">
          <CreationMenu decks={decks} />
          <Button type="button" title="Deletion Menu" variant="outline" size="icon">
            <Trash2/>
          </Button>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex flex-wrap gap-4 mx-8 mb-4">
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
        </div>
        <ShowCards cards={cards} decks={decks} uncategorizedDeck={uncategorizedDeck} uponChange={() => navigate("/dashboard", { replace: true })} />
    </div>
  );
}

export default Dashboard;

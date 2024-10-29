import { Lock, Trash2 } from "lucide-react";
import { useLoaderData, Link } from "react-router-dom";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreationMenu from "@/components/dashboard/creationMenu";
import { getFormattedDate } from "@/utils/time";

interface IDashboardLoaderData {
  decks: ILessDeck[];
  cards: ICard[];
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
  const cards: ICard[] = [];
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
    cards.push(cardData.data);
  }
  decks.sort((a, b) => (a.dateUpdated > b.dateUpdated || a.name < b.name) ? -1 : 1);
  cards.sort((a, b) => a.question > b.question ? 1 : -1);

  return { decks: decks, cards: cards };
}

export function Dashboard() {
  const { decks, cards } = useLoaderData() as IDashboardLoaderData;

  return (
    <div className="my-4">
      <div className="flex justify-between mx-4 mb-4">
        <h1 className="ml-6">Dashboard</h1>
        <div className="flex gap-1">
          <CreationMenu />
          <Button variant="outline" size="icon">
            <Trash2/>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mx-8">
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
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

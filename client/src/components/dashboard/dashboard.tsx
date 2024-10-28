import { Lock, Trash2 } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreationMenu from "@/components/dashboard/creationMenu";

interface ILessDeck {
  _id: string;
  name: string;
  dateUpdated: string;
  isPrivate: boolean;
}

interface IMoreDeck {
  owner: string;
  name: string;
  description: string;
  dateCreated: string;
  dateUpdated: string;
  cards: string[];
  isPrivate: boolean;
  isEditable: boolean;
  likes: number;
}

interface ICard {
  question: string;
  answer: string;
  hint: string;
  deck: string;
}

interface ICustomResponse<T> {
  status: string;
  message: string;
  data: T;
}

export async function DashboardLoader() {
  // Get all Decks owned by or shared to the User
  const res = await fetchWithAuth(
    "http://localhost:2442/deck/all",
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
    `http://localhost:2442/deck/${uncat._id}`,
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
      `http://localhost:2442/card/${cardID}`,
      "get"
    ).catch((err: Error) => {
      console.error(err.message || "Failed to fetch card");
    });
    if (!cardRes?.ok)
      continue;

    const cardData = await cardRes.json() as ICustomResponse<ICard>;
    cards.push(cardData.data);
  }

  return { decks: decks, cards: cards };
}

export function Dashboard() {
  const { decks, cards } = useLoaderData() as { decks: ILessDeck[], cards: ICard[] };

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
            <CardHeader>
              <CardTitle>{deck.name}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <span>{deck.dateUpdated}</span>
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

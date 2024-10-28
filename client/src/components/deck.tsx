import { Play, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IDeckLoaderData {
  deckInfo: IMoreDeck;
  cards: ICard[];
}

export async function DeckLoader({ params }: LoaderFunctionArgs): Promise<IDeckLoaderData> {
  const deckID = params.did;
  const res = await fetchWithAuth(
    `http://localhost:2442/deck/${deckID}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch decks");

  const deckData = await res.json() as ICustomResponse<IMoreDeck>;
  const cards: ICard[] = [];

  for (const cardID of deckData.data.cards) {
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

  return { deckInfo: deckData.data, cards: cards };
}

export function Deck() {
  const { did } = useParams();
  const { deckInfo, cards } = useLoaderData() as IDeckLoaderData;
  const navigate = useNavigate();

  // TOOO: Add more Deck info
  return (
    <div className="my-4">
      <div className="flex justify-between mx-4 mb-4">
        <h1 className="ml-6">{deckInfo.name}</h1>
        <div className="flex gap-1">
          <Button onClick={() => navigate(`/play/${did}`)} disabled={cards.length == 0}>
            <Play/>
            <span className="select-none">Play</span>
          </Button>
          <Button variant="outline" size="icon">
            <Plus />
          </Button>
          <Button variant="outline" size="icon">
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mx-8">
        {cards.map((card, idx) => (
          <Card className="min-w-72 flex-1" key={10000 + idx}>
            <CardHeader>
              <CardTitle>{card.question}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Deck;

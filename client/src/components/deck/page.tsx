import { useParams, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { Lock } from "lucide-react";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeckLikeButton, DeckPlayButton, CardCreationDialog, DeckOptionsDropdown } from "./options";

interface IDeckLoaderData {
  ownerInfo: IUser;
  deckInfo: IMoreDeck;
  cards: ICard[];
}

export async function DeckLoader({ params }: LoaderFunctionArgs): Promise<IDeckLoaderData> {
  // Get Deck Info
  const deckID = params.did;
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch decks");
  const deckData = await res.json() as ICustomResponse<IMoreDeck>;

  // Get Owner Info
  const ownerRes = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/user/get/${deckData.data.owner}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Owner");
  });
  if (!ownerRes?.ok)
    throw new Error("Failed to fetch Owner");
  const ownerData = await ownerRes.json() as ICustomResponse<IUser>;

  // Get Deck Cards
  // TODO: Possibly make it fetch during page rendered
  const cards: ICard[] = [];
  for (const cardID of deckData.data.cards) {
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
  if (deckData.data.isLiked) // Corrects Like Count logic in UI
    deckData.data.likes -= 1;

  return { ownerInfo: ownerData.data, deckInfo: deckData.data, cards: cards };
}

export function Deck() {
  const { did } = useParams();
  const { ownerInfo, deckInfo, cards } = useLoaderData() as IDeckLoaderData;

  return (
    <div className="my-4">
      <div className="flex justify-between mx-4 mb-4">
        <h1 className="ml-6 flex gap-1 items-center">
          {deckInfo.isPrivate && <Lock className="size-4" />}
          <span>{ownerInfo.username} - {deckInfo.name}</span>
        </h1>
        <div className="flex gap-1">
          <DeckLikeButton deckID={did!} likes={deckInfo.likes} isLiked={deckInfo.isLiked} />
          <DeckPlayButton deckID={did!} cardsCount={cards.length} />
          {deckInfo.isEditable && <>
            <CardCreationDialog deckID={did!} />
            <DeckOptionsDropdown deckID={did!} owner={ownerInfo.username} />
          </>}
        </div>
      </div>
      <p className="ml-10 mr-4 mb-4 font-light">{deckInfo.description}</p>
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

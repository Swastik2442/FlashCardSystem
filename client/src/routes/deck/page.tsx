import { Link, useParams, useLoaderData, LoaderFunctionArgs, useNavigate } from "react-router-dom";
import { Lock, Plus } from "lucide-react";
import ShowCards from "@/components/showCards";
import { DeckLikeButton, DeckPlayButton, CardCreationDialog, DeckOptionsDropdown } from "./options";
import { isDeckUncategorized, getDeck, getDeckCards, getAllDecks } from "@/api/deck";
import { getUser } from "@/api/user";
import { DECKS_STORAGE_KEY } from "@/constants";

interface IDeckLoaderData {
  ownerInfo: IUser;
  deckInfo: IMoreDeck;
  cards: ICard[];
  allDecks: ILessDeck[];
  uncategorizedDeck: ILessDeck;
}

export async function DeckLoader({ params }: LoaderFunctionArgs): Promise<IDeckLoaderData> {
  const deckID = params.did;
  if (!deckID)
    throw new Error("Deck ID not found");
  
  // TODO: Possibly make it fetch during page rendering
  const deckInfo = await getDeck(deckID);
  const ownerInfo = await getUser(deckInfo.owner);
  const cards = await getDeckCards(deckID);
  cards.sort((a, b) => a.question > b.question ? 1 : -1);

  // Corrects Like Count logic in UI
  if (deckInfo.isLiked)
    deckInfo.likes -= 1;

  // Get all Decks owned by or shared to the User
  const allDecksString = localStorage.getItem(DECKS_STORAGE_KEY);
  const allDecks = allDecksString ? JSON.parse(allDecksString) as ILessDeck[] : [];
  if (allDecks.length === 0) {
    const allDecks = await getAllDecks();
    allDecks.sort((a, b) => (a.dateUpdated > b.dateUpdated || a.name < b.name) ? -1 : 1);
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(allDecks));
  }

  const decks = allDecks.filter((deck) => !isDeckUncategorized(deck));
  const uncat = allDecks.find(isDeckUncategorized);

  return { ownerInfo: ownerInfo, deckInfo: deckInfo, cards: cards, allDecks: decks, uncategorizedDeck: uncat ?? { _id: "", name: "#UNCATEGORISED#", isPrivate: true, dateUpdated: "" } };
}

export function Deck() {
  const { did } = useParams();
  const { ownerInfo, deckInfo, cards, allDecks, uncategorizedDeck } = useLoaderData() as IDeckLoaderData;
  const navigate = useNavigate();

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4 mb-4">
        <h1 className="flex gap-1 items-center">
          {deckInfo.isPrivate && <Lock className="size-4" />}
          <Link to={`/users/${ownerInfo.username}`} className="hidden sm:inline-block font-extralight hover:underline">{ownerInfo.username}</Link>
          <span className="hidden sm:inline-block font-thin"> | </span>
          <span>{deckInfo.name}</span>
        </h1>
        <div className="flex gap-1">
          <DeckLikeButton deckID={did!} likes={deckInfo.likes} isLiked={deckInfo.isLiked} />
          <DeckPlayButton deckID={did!} cardsCount={cards.length} />
          {deckInfo.isEditable && <>
            <CardCreationDialog deckID={did!} />
            <DeckOptionsDropdown deckID={did!} deck={deckInfo} owner={ownerInfo.username} />
          </>}
        </div>
      </div>
      <p className="ml-10 mr-4 text-sm font-extralight">{deckInfo.description}</p>
      <hr className="my-4" />
      {cards.length === 0 ? (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Cards found</span>
          <h2>
            <span>Start creating them using the</span>
            <Plus className="inline-block size-4 m-1 mb-2" />
            <span>Icon in the Top-Right Corner.</span>
          </h2>
        </div>
      ) : <ShowCards cards={cards} decks={allDecks} uncategorizedDeck={uncategorizedDeck} uponChange={() => navigate(`/deck/${did}`, { replace: true })} />}
    </div>
  );
}

export default Deck;

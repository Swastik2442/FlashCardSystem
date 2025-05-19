import { useNavigate, useLoaderData, Link } from "react-router-dom";
import { Lock, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ShowCards from "@/components/showCards";
import { getFormattedDate } from "@/utils/time";
import { CreationMenu } from "./options";
import { isDeckUncategorised, getAllDecks, getDeckCards } from "@/api/deck";
import { DECKS_STORAGE_KEY, UNCATEGORISED_CARDS_STORAGE_KEY, UNCATEGORISED_DECK_OBJ } from "@/constants";

interface IDashboardLoaderData {
  decks: ILessDeck[];
  cards: ICard[];
  uncategorisedDeck: ILessDeck;
}

/**
 * Loader function for the `/dashboard` Route
 * @returns Decks and Cards owned by or shared to the User
 */
export async function DashboardLoader(): Promise<IDashboardLoaderData> {
  const allDecks = await getAllDecks();
  const decks = allDecks.filter((deck) => !isDeckUncategorised(deck));
  decks.sort((a, b) => (a.dateUpdated > b.dateUpdated || a.name < b.name) ? -1 : 1);

  const uncat = allDecks.find(isDeckUncategorised);
  const cards = uncat ? await getDeckCards(uncat._id) : [];
  cards.sort((a, b) => a.question > b.question ? 1 : -1);

  localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(allDecks));
  localStorage.setItem(UNCATEGORISED_CARDS_STORAGE_KEY, JSON.stringify(cards));

  return {
    decks: decks,
    cards: cards,
    uncategorisedDeck: uncat ?? UNCATEGORISED_DECK_OBJ
  };
}

/**
 * Component for the Dashboard page
 */
export function Dashboard() {
  const { decks, cards, uncategorisedDeck } = useLoaderData<IDashboardLoaderData>();
  const navigate = useNavigate();

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">Dashboard</h1>
        <CreationMenu decks={decks} />
      </div>
      <hr className="my-4" />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        className="flex flex-wrap gap-4 mx-8 mb-4"
      >
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
          <Card className="min-w-72 flex-1 flex flex-col justify-between" key={idx}>
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
        </motion.div>
        <ShowCards
          cards={cards}
          decks={decks}
          uncategorisedDeck={uncategorisedDeck}
          editable={true}
          uponChange={() => { void navigate("/dashboard", { replace: true }); }}
        />
    </div>
  );
}

export default Dashboard;

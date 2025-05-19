import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Home, ArrowLeftCircle, ArrowRightCircle, BadgeInfo, TicketCheck } from "lucide-react";
import FlashCard from "@/components/flashCard";
import { FloatingDock } from "@/components/ui/floating-dock";
import type { IFloatingDockItem } from "@/components/ui/floating-dock";
import { getAllDecks, getDeck, getDeckCards, isDeckEditable, isDeckUncategorised } from "@/api/deck";
import { secondsToString } from "@/utils/time";

interface IPlaygroundLoaderData {
  deckID: string;
  deck: ILessDeck | IMoreDeck;
  cards: ICard[];
}

/**
 * Loader function for the `/play` and `/play/:did` Routes
 * @param params Parameters passed to the Route
 * @returns information about the Deck and its Cards
 */
export async function PlaygroundLoader({
  params
}: LoaderFunctionArgs): Promise<IPlaygroundLoaderData> {
  let deckID = params.did;
  if (!deckID) {
    const allDecks = await getAllDecks();
    const uncat = allDecks.find(isDeckUncategorised);
    if (!uncat)
      throw new Error("Uncategorised Deck not found");

    deckID = uncat._id;
    const cards = await getDeckCards(deckID);
    return { deckID, deck: uncat, cards };
  }

  const deck = await getDeck(deckID);
  const cards = await getDeckCards(deckID);
  return { deckID, deck, cards };
}

/**
 * Function to get a random card to be displayed
 * @param playedCards Indices of the Cards already played
 * @param totalCards Total Number of Cards in the Deck
 * @returns Index of the next Card
 */
function nextCard(playedCards: number[], totalCards: number) {
  let random = Math.floor(Math.random() * totalCards);
  if (playedCards.length === totalCards) {
    if (import.meta.env.NODE_ENV == "development")
      console.log("No more cards left");
    return random;
  }
  while (playedCards.includes(random)) {
    random = Math.floor(Math.random() * totalCards);
  }
  return random;
}

/**
 * A Component that renders the Playground
 */
export function Playground() {
  const { deckID, deck, cards } = useLoaderData<IPlaygroundLoaderData>();
  const [playedCards, setPlayedCards] = useState(
    useMemo(() => [nextCard([], cards.length)], [cards.length])
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [flip, setFlip] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { // Increments Timer
    if (submitted || cards.length == 0)
      return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, cards.length]);

  function handleAnswerCheck(answer: string) {
    setSubmitted(true);
    if (answer.trim() === cards[playedCards[currentIndex]].answer.trim()) {
      toast.success("Correct Answer", {
        description: `You took ${timer} seconds to answer`,
        duration: 10000
      });
    } else {
      toast.error("Incorrect Answer");
      setSubmitted(false);
    }
  }
  function navigateBack() {
    void navigate(
      isDeckUncategorised(deck) ? "/dashboard" : `/deck/${deckID}`
    );
  }

  const dockItems: IFloatingDockItem[] = [
    {
      title: "Show Hint",
      icon: <BadgeInfo />,
      onClick: () => toast(
        "Hint",
        {
          description: cards[playedCards[currentIndex]].hint,
          duration: 15000
        }
      ),
    },
    {
      title: "Previous",
      icon: <ArrowLeftCircle />,
      onClick: () => {
        if (currentIndex == 0) {
          toast.error("Nothing before this");
          return;
        }

        setCurrentIndex(i => i - 1);
        setTimer(0);
        setSubmitted(false);
        (document.getElementById("answer") as HTMLInputElement).value = "";
      },
    },
    {
      title: `Back to ${isDeckUncategorised(deck) ? "Dashboard" : "Deck"}`,
      icon: <Home />,
      onClick: navigateBack,
    },
    {
      title: "Next",
      icon: <ArrowRightCircle />,
      onClick: () => {
        if (currentIndex < playedCards.length - 1) {
          setCurrentIndex(i => i + 1);
        } else if (playedCards.length === cards.length) {
          toast.info("Shuffling the Deck");
          const next = nextCard([playedCards[currentIndex]], cards.length);
          setPlayedCards([next]);
          setCurrentIndex(0);
        } else {
          const next = nextCard(playedCards, cards.length);
          setPlayedCards(c => [...c, next]);
          setCurrentIndex(i => i + 1);
        }
        setTimer(0);
        setSubmitted(false);
        (document.getElementById("answer") as HTMLInputElement).value = "";
      },
    },
    {
      title: "Flip",
      icon: <TicketCheck />,
      onClick: () => {
        setFlip(!flip)
        setSubmitted(true);
      },
    }
  ];

  return (
    <>
      <hr />
      <div className="ml-10 mr-4 flex justify-between my-4">
        <span>{isDeckUncategorised(deck) ? "Play" : deck.name}</span>
        <span>{secondsToString(timer)}</span>
      </div>
      <div className="flex justify-center">
        {cards.length === 0 ? <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center w-full h-full">
            <span className="font-thin">No Cards found</span>
            {(!isDeckEditable(deck)) ? <h2>
              <span>Start creating them from the </span>
              <button onClick={navigateBack} className="hover:underline">
                {isDeckUncategorised(deck) ? "Dashboard" : "Deck's Page"}
              </button>
            </h2> : <h2>Ask the Owner to add some</h2>}
          </div>
        </motion.div> : <FlashCard
          question={cards[playedCards[currentIndex]].question}
          answer={cards[playedCards[currentIndex]].answer}
          handleAnswerCheck={handleAnswerCheck}
          flipped={flip}
          disabled={submitted}
        />}
      </div>
      <div className="mt-auto flex justify-end sm:justify-center">
        <FloatingDock items={cards.length === 0 ? [dockItems[2]] : dockItems } />
      </div>
    </>
  );
}

export default Playground;

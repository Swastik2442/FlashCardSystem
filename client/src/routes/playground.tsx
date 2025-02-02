import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { toast } from "sonner";
import { Home, ArrowLeftCircle, ArrowRightCircle, BadgeInfo, TicketCheck, Check } from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import type { IFloatingDockItem } from "@/components/ui/floating-dock";
import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllDecks, getDeck, getDeckCards, isDeckUncategorised } from "@/api/deck";
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
export async function PlaygroundLoader({ params }: LoaderFunctionArgs): Promise<IPlaygroundLoaderData> {
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
    console.error("No more cards left");
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
  const [playedCards, setPlayedCards] = useState(useMemo(() => [nextCard([], cards.length)], [cards.length]));
  const [currentIndex, setCurrentIndex] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [flip, setFlip] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted)
      return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  function handleCheckAnswer() {
    setSubmitted(true);
    const answer = (document.getElementById("answer") as HTMLInputElement).value;
    if (answer.trim() === cards[playedCards[currentIndex]].answer.trim()) {
      toast.success("Correct Answer", { description: `You took ${timer} seconds to answer`, duration: 10000 });
    } else {
      toast.error("Incorrect Answer");
      setSubmitted(false);
    }
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
      onClick: () => { void navigate(isDeckUncategorised(deck) ? "/dashboard" : `/deck/${deckID}`); },
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
        <FlipCard flip={flip}>
          <FlipCardFront>
            <div className="h-full rounded-lg bg-background text-foreground p-4 flex flex-col justify-between">
              <p className="mb-4">{cards[playedCards[currentIndex]].question}</p>
              <div className="flex">
                <Input
                  id="answer"
                  placeholder="Answer"
                  className="border-r-transparent rounded-r-none"
                  disabled={submitted}
                />
                <Button
                  onClick={handleCheckAnswer}
                  type="submit"
                  title="Submit Answer"
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  disabled={submitted}
                >
                  <Check />
                </Button>
              </div>
            </div>
          </FlipCardFront>
          <FlipCardBack>
            <div className="h-full rounded-lg bg-gradient-to-t from-green-400 to-green-500 text-foreground dark:text-background p-4">
              <p>{cards[playedCards[currentIndex]].answer}</p>
            </div>
          </FlipCardBack>
        </FlipCard>
      </div>
      <div className="mt-auto flex justify-end sm:justify-center">
        <FloatingDock items={dockItems} />
      </div>
    </>
  );
}

export default Playground;

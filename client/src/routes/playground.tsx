import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { toast } from "sonner";
import { Home, ArrowLeftCircle, ArrowRightCircle, BadgeInfo, TicketCheck, Check } from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import type { IFloatingDockItem } from "@/components/ui/floating-dock";
import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllDecks, getDeck, getDeckCards, isDeckUncategorized } from "@/api/deck";
import { secondsToString } from "@/utils/time";

interface IPlaygroundLoaderData {
  deckID: string;
  deck: ILessDeck | IMoreDeck;
  cards: ICard[];
}

export async function PlaygroundLoader({ params }: LoaderFunctionArgs): Promise<IPlaygroundLoaderData> {
  let deckID = params.did;
  if (!deckID) {
    const allDecks = await getAllDecks();
    const uncat = allDecks.find(isDeckUncategorized);
    if (!uncat)
      throw new Error("Uncategorized Deck not found");
    
    deckID = uncat._id;
    const cards = await getDeckCards(deckID);
    return { deckID, deck: uncat, cards };
  }

  const deck = await getDeck(deckID);
  const cards = await getDeckCards(deckID);
  return { deckID, deck, cards };
}

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

export function Playground() {
  const { deckID, deck, cards } = useLoaderData() as IPlaygroundLoaderData;
  const [currentCard, setCurrentCard] = useState(useMemo(() => nextCard([], cards.length), [cards.length]));
  const [playedCards, setPlayedCards] = useState([currentCard]);
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
    if (answer.trim() === cards[currentCard].answer.trim()) {
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
      onClick: () => toast("Hint", { description: cards[currentCard].hint, duration: 15000 }),
    },
    {
      title: "Previous",
      icon: <ArrowLeftCircle />,
      onClick: () => {
        if (currentIndex == 0) {
          toast.error("Nothing before this");
          return;
        }

        setCurrentIndex((i) => i - 1);
        setCurrentCard(playedCards[currentIndex]);
        setTimer(0);
        setSubmitted(false);
      },
    },
    {
      title: "Back to Deck",
      icon: <Home />,
      onClick: () => navigate(`/deck/${deckID}`),
    },
    {
      title: "Next",
      icon: <ArrowRightCircle />,
      onClick: () => {
        if (currentIndex < playedCards.length - 1) {
          setCurrentIndex((i) => i + 1);
          setCurrentCard(playedCards[currentIndex + 1]);
        } else if (playedCards.length === cards.length) {
          toast.info("Shuffling the Deck");
          const next = nextCard([], cards.length);
          setPlayedCards([next]);
          setCurrentIndex(0);
          setCurrentCard(next);
        } else {
          const next = nextCard(playedCards, cards.length);
          setPlayedCards([...playedCards, next]);
          setCurrentIndex((i) => i + 1);
          setCurrentCard(next);
        }
        setTimer(0);
        setSubmitted(false);
      },
    },
    {
      title: "Flip",
      icon: <TicketCheck />,
      onClick: () => {
        setFlip(!flip)
        if (flip) setSubmitted(true);
      },
    }
  ];

  return (
    <>
      <hr />
      <div className="ml-10 mr-4 flex justify-between my-4">
        <span>{isDeckUncategorized(deck) ? "Play" : deck.name}</span>
        <span>{secondsToString(timer)}</span>
      </div>
      <div className="flex justify-center">
        <FlipCard flip={flip}>
          <FlipCardFront>
            <div className="h-full rounded-lg bg-white p-4 flex flex-col justify-between">
              <p className="mb-4">{cards[currentCard].question}</p>
              <div className="flex">
                <Input id="answer" placeholder="Answer" className="border-r-transparent rounded-r-none" disabled={submitted} />
                <Button onClick={handleCheckAnswer} variant="outline" size="icon" className="rounded-l-none" disabled={submitted}><Check /></Button>
              </div>
            </div>
          </FlipCardFront>
          <FlipCardBack>
            <div className="h-full rounded-lg bg-green-400 p-4">
              <p>{cards[currentCard].answer}</p>
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

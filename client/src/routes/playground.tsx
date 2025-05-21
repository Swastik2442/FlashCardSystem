import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Home,
  ArrowLeftCircle,
  ArrowRightCircle,
  BadgeInfo,
  TicketCheck
} from "lucide-react"
import FlashCard from "@/components/flashCard"
import { FloatingDock } from "@/components/ui/floating-dock"
import type { IFloatingDockItem } from "@/components/ui/floating-dock"
import { isDeckEditable } from "@/api/deck"
import {
  useDeckCardsQuery,
  useDeckQuery,
  useUncatDeckQuery
} from "@/hooks/deckQueries"
import { secondsToString } from "@/utils/time"

/**
 * Function to get a random card to be displayed
 * @param playedCards Indices of the Cards already played
 * @param totalCards Total Number of Cards in the Deck
 * @returns Index of the next Card
 */
function nextCard(playedCards: number[], totalCards: number) {
  let random = Math.floor(Math.random() * totalCards)
  if (playedCards.length === totalCards) {
    if (import.meta.env.DEV)
      console.log("No more cards left")
    return random
  }
  while (playedCards.includes(random)) {
    random = Math.floor(Math.random() * totalCards)
  }
  return random
}

/**
 * A Component that renders the Playground
 */
export function Playground() {
  const { did } = useParams()
  const navigate = useNavigate()

  const uncatDeckQuery = useUncatDeckQuery()
  const deckID = useMemo(
    () => did ?? uncatDeckQuery.data?._id,
    [did, uncatDeckQuery.data?._id]
  )
  const isDeckUncategorised = useMemo(
    () => deckID === uncatDeckQuery.data?._id,
    [deckID, uncatDeckQuery.data?._id]
  )

  const deckQuery = useDeckQuery(deckID)
  const cardsQuery = useDeckCardsQuery(deckID)

  const [playedCards, setPlayedCards] = useState(useMemo(
    () => [nextCard([], cardsQuery.data ? cardsQuery.data?.length : 0)],
    [cardsQuery.data]
  ))
  const [currentIndex, setCurrentIndex] = useState(0)

  const [submitted, setSubmitted] = useState(false)
  const [flip, setFlip] = useState(false)
  const [timer, setTimer] = useState(0)
  const clearInput = useCallback(() => {
    (document.getElementById("answer") as HTMLInputElement).value = ""
  }, [])

  useEffect(() => { // Increments Timer
    if (submitted || cardsQuery.data?.length == 0)
      return

    const interval = setInterval(() => {
      setTimer((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [submitted, cardsQuery.data?.length])

  // TODO: Do Something better
  function handleAnswerCheck(answer: string) {
    if (!cardsQuery.data) return
    setSubmitted(true)
    if (answer.trim().toLowerCase() === cardsQuery.data[playedCards[currentIndex]].answer.trim().toLowerCase()) {
      toast.success("Correct Answer", {
        description: `You took ${timer} seconds to answer`,
        duration: 10000
      })
    } else {
      toast.error("Incorrect Answer")
      setSubmitted(false)
    }
  }
  function navigateBack() {
    void navigate(
      isDeckUncategorised ? "/dashboard" : `/deck/${deckID}`
    )
  }

  const dockItems: IFloatingDockItem[] = [
    {
      title: "Show Hint",
      icon: <BadgeInfo />,
      onClick: () => toast(
        "Hint",
        {
          description: cardsQuery.data![playedCards[currentIndex]].hint,
          duration: 15000
        }
      ),
    },
    {
      title: "Previous",
      icon: <ArrowLeftCircle />,
      onClick: () => {
        if (currentIndex == 0) {
          toast.error("Nothing before this")
          return
        }

        setCurrentIndex(i => i - 1)
        setTimer(0)
        setSubmitted(false)
        clearInput()
      },
    },
    {
      title: `Back to ${isDeckUncategorised ? "Dashboard" : "Deck"}`,
      icon: <Home />,
      onClick: navigateBack,
    },
    {
      title: "Next",
      icon: <ArrowRightCircle />,
      onClick: () => {
        if (currentIndex < playedCards.length - 1) {
          // Go to Next Card if present
          setCurrentIndex(i => i + 1)
        } else if (playedCards.length === cardsQuery.data?.length) {
          // Restart the Play
          toast.info("Shuffling the Deck")
          const next = nextCard([playedCards[currentIndex]], cardsQuery.data?.length)
          setPlayedCards([next])
          setCurrentIndex(0)
        } else {
          // Get next random card and go to it
          const next = nextCard(playedCards, cardsQuery.data!.length)
          setPlayedCards(c => [...c, next])
          setCurrentIndex(i => i + 1)
        }
        setTimer(0)
        setSubmitted(false)
        clearInput()
      },
    },
    {
      title: "Flip",
      icon: <TicketCheck />,
      onClick: () => {
        setFlip(!flip)
        setSubmitted(true)
      },
    }
  ]

  return (
    <>
      <hr />
      <div className="ml-10 mr-4 flex justify-between my-4">
        <span>{(isDeckUncategorised || !deckQuery.data?.name) ? "Play" : deckQuery.data.name}</span>
        <span>{secondsToString(timer)}</span>
      </div>
      {cardsQuery.data && <>
      <div className="flex justify-center">
        {cardsQuery.data?.length === 0 ? <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center w-full h-full">
            <span className="font-thin">No Cards found</span>
            <h2>
              {(isDeckUncategorised || (deckQuery.data && isDeckEditable(deckQuery.data))) ? <>
              <span>Start creating them from the </span>
              <button onClick={navigateBack} className="hover:underline">
                {isDeckUncategorised ? "Dashboard" : "Deck's Page"}
              </button>
              </> : "Ask the Owner to add some"}
            </h2>
          </div>
        </motion.div> : <FlashCard
          question={cardsQuery.data[playedCards[currentIndex]].question}
          answer={cardsQuery.data[playedCards[currentIndex]].answer}
          handleAnswerCheck={handleAnswerCheck}
          flipped={flip}
          disabled={submitted}
        />}
      </div>
      <div className="mt-auto flex justify-end sm:justify-center">
        <FloatingDock items={cardsQuery.data.length === 0 ? [dockItems[2]] : dockItems } />
      </div>
      </>}
    </>
  )
}

export default Playground

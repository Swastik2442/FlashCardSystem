import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Lock, Plus } from "lucide-react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import ShowCards from "@/components/showCards"
import { CreationMenu } from "./options"
import { isDeckUncategorised } from "@/api/deck"
import { getFormattedDate } from "@/utils/time"
import {
  useAllDecksQuery,
  useDeckCardsQuery,
  useUncatDeckQuery
} from "@/queries/decks"

/**
 * Component for the Dashboard page
 */
export function Dashboard() {
  const decksQuery = useAllDecksQuery()
  const uncatQuery = useUncatDeckQuery()
  const cardsQuery = useDeckCardsQuery(uncatQuery.data?._id)

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">Dashboard</h1>
        {decksQuery.data && <CreationMenu decks={decksQuery.data} />}
      </div>
      <hr className="my-4" />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        className="flex flex-wrap gap-4 mx-8 mb-4"
      >
        {decksQuery.data?.length === 0 && cardsQuery.data?.length === 0 && (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Decks or Cards found</span>
          <h2>
            <span>Start creating them using the</span>
            <Plus className="inline-block size-4 m-1 mb-2" />
            <span>Icon in the Top-Right Corner.</span>
          </h2>
        </div>
        )}
        {decksQuery.data?.map((deck, idx) => isDeckUncategorised(deck) ? "" : (
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
        {uncatQuery.data && <ShowCards deckID={uncatQuery.data?._id} editable={true} />}
    </div>
  )
}

export default Dashboard

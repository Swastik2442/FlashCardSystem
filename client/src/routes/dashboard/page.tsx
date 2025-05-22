import { Plus } from "lucide-react"
import ShowCards from "@/components/showCards"
import { CreationMenu } from "./options"
import { isDeckUncategorised } from "@/api/deck"
import {
  useAllDecksQuery,
  useDeckCardsQuery,
  useUncatDeckQuery
} from "@/hooks/deckQueries"
import ShowDecks from "@/components/showDecks"

/**
 * Component for the Dashboard page
 */
export function Dashboard() {
  const decksQuery = useAllDecksQuery()
  const uncatIDQuery = useUncatDeckQuery((data) => data?._id)
  const cardsLenQuery = useDeckCardsQuery(
    uncatIDQuery.data,
    (data) => data.length
  )

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">Dashboard</h1>
        {decksQuery.data && <CreationMenu decks={decksQuery.data} />}
      </div>
      <hr className="my-4" />
      <ShowDecks decks={decksQuery.data?.filter(v => !isDeckUncategorised(v)) ?? []} className="mx-8 mb-4">
        {decksQuery.data?.length === 1 && cardsLenQuery.data === 0 && (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Decks or Cards found</span>
          <h2>
            <span>Start creating them using the</span>
            <Plus className="inline-block size-4 m-1 mb-2" />
            <span>Icon in the Top-Right Corner.</span>
          </h2>
        </div>
        )}
      </ShowDecks>
      {uncatIDQuery.data && <ShowCards deckID={uncatIDQuery.data} editable={true} />}
    </div>
  )
}

export default Dashboard

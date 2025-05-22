import { Link, useParams } from "react-router-dom"
import { Lock, Plus } from "lucide-react"
import ShowCards from "@/components/showCards"
import {
  DeckLikeButton,
  DeckPlayButton,
  CardCreationDialog,
  DeckOptionsDropdown
} from "./options"
import {
  useDeckOwnerQuery,
  useDeckCardsQuery,
  useDeckQuery
} from "@/hooks/deckQueries"

/**
 * Component for the Deck page
 */
export function Deck() {
  const { did } = useParams()
  const deckQuery = useDeckQuery(did)
  const cardsQuery = useDeckCardsQuery(did)
  const ownerQuery = useDeckOwnerQuery(did, (data) => data.username)

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4 mb-4">
        <h1 className="flex gap-1 items-center">
          {deckQuery.data?.isPrivate && <Lock className="size-4" />}
          {ownerQuery.data && <Link
            to={`/users/${ownerQuery.data}`}
            className="hidden sm:inline-block font-extralight hover:underline"
          >
            {ownerQuery.data}
          </Link>}
          <span className="hidden sm:inline-block font-thin"> | </span>
          <span>{deckQuery.data?.name}</span>
        </h1>
        <div className="flex gap-1">
          {deckQuery.data && <DeckLikeButton
            deckID={did!}
            likes={deckQuery.data.likes}
            isLiked={deckQuery.data.isLiked}
          />}
          <DeckPlayButton
            deckID={did!}
            disabled={cardsQuery.data?.length == 0}
          />
          {deckQuery.data?.isEditable && <>
            <CardCreationDialog deckID={did!} />
            {ownerQuery.data && <DeckOptionsDropdown
              deckID={did!}
              deck={deckQuery.data}
              owner={ownerQuery.data}
            />}
          </>}
        </div>
      </div>
      <p className="ml-10 mr-4 text-sm font-extralight">
        {deckQuery.data?.description}
      </p>
      <hr className="my-4" />
      {cardsQuery.data?.length === 0 ? (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Cards found</span>
          <h2>
            <span>Start creating them using the</span>
            <Plus className="inline-block size-4 m-1 mb-2" />
            <span>Icon in the Top-Right Corner.</span>
          </h2>
        </div>
      ) : <>{deckQuery.data && <ShowCards
        deckID={did!}
        editable={deckQuery.data.isEditable}
      />}</>}
    </div>
  )
}

export default Deck

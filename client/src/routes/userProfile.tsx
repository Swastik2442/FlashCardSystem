import { useParams } from "react-router-dom"
import { useUserDecksQuery, useUserLikedDecksQuery, useUserQuery } from "@/hooks/userQueries"
import ShowDecks from "@/components/showDecks"

/**
 * A Component that renders the User Profile
 */
export function UserProfile() {
  const { username } = useParams()
  if (!username) throw new Error("username not found")

  const userQuery = useUserQuery(username)
  const decksQuery = useUserDecksQuery(username)
  const likedDecksQuery = useUserLikedDecksQuery(username)

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4 mb-4">
        <h1 className="flex gap-1 items-center">
          <span className="font-extralight">{userQuery.data?.username ?? ""}</span>
          <span className="hidden sm:inline-block font-thin"> | </span>
          <span className="hidden sm:inline-block">{userQuery.data?.fullName ?? ""}</span>
        </h1>
      </div>
      <hr className="my-4" />
      {decksQuery.data && <>{decksQuery.data.length > 0 ? (
        <ShowDecks decks={decksQuery.data} className="mx-8" />
      ) : (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Decks found</span>
        </div>
      )}</>}
      {likedDecksQuery.data && <>
        <hr className="my-4" />
        <h2 className="ml-10 select-none mb-4">Liked Decks</h2>
        {likedDecksQuery.data.length > 0 ? (
          <ShowDecks decks={likedDecksQuery.data} className="mx-8" />
        ) : (
          <div className="text-center w-full h-full">
            <span className="font-thin">No Liked Decks yet</span>
          </div>
        )}
      </>}
    </div>
  )
}

export default UserProfile

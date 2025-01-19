import { Link, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getFormattedDate } from "@/utils/time";
import { getUser, getUserDecks, getUserLikedDecks } from "@/api/user";
import { USER_STORAGE_KEY } from "@/constants";

interface IUserProfileLoaderData {
  userInfo: IUser;
  userDecks: ILessDeck[];
  likedDecks: ILessDeck[] | null;
}

/**
 * Loader function for the `/user/:username` Route
 * @param params Parameters passed to the Route
 * @returns information about the User
 */
export async function UserProfileLoader({
  params
}: LoaderFunctionArgs): Promise<IUserProfileLoaderData> {
  const username = params.username;
  if (!username)
    throw new Error("username not found");

  const userInfo = await getUser(username);
  const userDecks = await getUserDecks(username);

  let likedDecks = null;
  if (username == localStorage.getItem(USER_STORAGE_KEY)) {
    likedDecks = await getUserLikedDecks();
  }

  return { userInfo, userDecks, likedDecks };
}

/**
 * A Component that renders the User Profile
 */
export function UserProfile() {
  const { userInfo, userDecks, likedDecks } = useLoaderData() as IUserProfileLoaderData;

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4 mb-4">
        <h1 className="flex gap-1 items-center">
          <span className="font-extralight">{userInfo.username}</span>
          <span className="hidden sm:inline-block font-thin"> | </span>
          <span className="hidden sm:inline-block">{userInfo.fullName}</span>
        </h1>
      </div>
      <hr className="my-4" />
      {userDecks.length > 0 ? (
        <div className="flex flex-wrap gap-4 mx-8">
        {userDecks.map((deck, idx) => (
            <Card className="min-w-72 flex-1" key={idx}>
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
        </div>
      ) : (
        <div className="text-center w-full h-full">
          <span className="font-thin">No Decks found</span>
        </div>
      )}
      {likedDecks && <>
        <hr className="my-4" />
        <h2 className="ml-10 select-none mb-4">Liked Decks</h2>
        {likedDecks.length > 0 ? (
          <div className="flex flex-wrap gap-4 mx-8">
            {likedDecks.map((deck, idx) => (
              <Card className="min-w-72 flex-1" key={idx}>
                <Link to={`/deck/${deck._id}`}>
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                  </CardHeader>
                </Link>
                <CardFooter className="flex justify-between">
                  <span className="text-sm font-light">{getFormattedDate(deck.dateUpdated)}</span>
                  {deck.isPrivate && <Lock className="size-4" />}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center w-full h-full">
            <span className="font-thin">You have not liked any Decks yet</span>
          </div>
        )}
      </>}
    </div>
  );
}

export default UserProfile;

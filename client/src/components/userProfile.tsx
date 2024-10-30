import { Link, useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import { Lock } from "lucide-react";
import { fetchWithAuth } from "@/hooks/authProvider";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getFormattedDate } from "@/utils/time";

interface IUserProfileLoaderData {
  userInfo: IUser;
  userDecks: ILessDeck[];
  likedDecks: ILessDeck[] | null;
}

export async function UserProfileLoader({ params }: LoaderFunctionArgs): Promise<IUserProfileLoaderData> {
  // Get User Info
  const username = params.username;
  if (!username)
    throw new Error("username not found");

  const res = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/user/get/${username}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch User");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch User");
  const userData = await res.json() as ICustomResponse<IUser>;

  // Get User Decks visible to current User
  const decksRes = await fetchWithAuth(
    `${import.meta.env.VITE_SERVER_HOST}/user/decks/${username}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch User Decks");
  });
  if (!decksRes?.ok)
    throw new Error("Failed to fetch User Decks");
  const decksData = await decksRes.json() as ICustomResponse<ILessDeck[]>;

  // Get Liked Decks if User is viewing their own profile
  let likedDecks = null;
  if (username == localStorage.getItem("fcs-user")) {
    const likedRes = await fetchWithAuth(
      `${import.meta.env.VITE_SERVER_HOST}/user/liked`,
      "get"
    ).catch((err: Error) => {
      console.error(err.message || "Failed to fetch Liked Decks");
    });
    if (!likedRes?.ok)
      throw new Error("Failed to fetch Liked Decks");

    const likedDecksData = await likedRes.json() as ICustomResponse<ILessDeck[]>;
    likedDecks = likedDecksData.data;
  }

  return { userInfo: userData.data, userDecks: decksData.data, likedDecks: likedDecks };
}

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
      {userDecks.length > 0 ?  (
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
      {likedDecks ? <>
        <hr className="my-4" />
        <h2 className="ml-10 select-none mb-4">Liked Decks</h2>
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
                <span>{deck.isPrivate ? <Lock className="size-4" /> : ""}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </> : <></>}
    </div>
  );
}

export default UserProfile;

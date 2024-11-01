import fetchWithCredentials from "@/utils/fetch";

export async function getUser(user: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/get/${user}`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch User");
  });

  const userData = await res.json() as ICustomResponse<IUser>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to fetch User");

  return userData.data;
}

export async function getUserFromSubstring(substring: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/getsub/${substring}`,
    "get",
  ).catch((err: Error) => {
    throw new Error(err?.message || "No such User found");
  });

  const data = await res.json() as ICustomResponse<IUserWithID[]>;
  if (!res?.ok)
    throw new Error(data?.message || "No such User found");

  return data.data;
}

export async function getUserDecks(username: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/decks/${username}`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch User Decks");
  });

  const decksData = await res.json() as ICustomResponse<ILessDeck[]>;
  if (!res?.ok)
    throw new Error(decksData.message || "Failed to fetch User Decks");

  return decksData.data;
}

export async function getUserLikedDecks() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/liked`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch Liked Decks");
  });

  const likedDecksData = await res.json() as ICustomResponse<ILessDeck[]>;
  if (!res?.ok)
    throw new Error(likedDecksData.message || "Failed to fetch Liked Decks");

  return likedDecksData.data;
}

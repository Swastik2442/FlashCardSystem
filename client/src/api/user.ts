import fetchWithCredentials from "@/utils/fetch";

/**
 * Makes a GET request to get the private details of the logged in User
 * @returns Details about the User
 */
export async function getUserPrivate() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user`, "get",
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to get User details");
  });

  const userData = await res.json() as ICustomResponse<IUserPrivate>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to get User details");

  return userData.data;
}

/**
 * Makes a GET request to get Information about a User
 * @param user Username or User ID of the User
 * @returns information about the User
 */
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

/**
 * Makes a GET request to get Users with the given substring in their Username
 * @param substring Substring to search for in the Usernames
 * @returns Users with the given substring in their Username
 */
export async function getUserFromSubstring(substring: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/substr/${substring}`,
    "get",
  ).catch((err: Error) => {
    throw new Error(err?.message || "No such User found");
  });

  const data = await res.json() as ICustomResponse<IUserWithID[]>;
  if (!res?.ok)
    throw new Error(data?.message || "No such User found");

  return data.data;
}

/**
 * Makes a GET request to get the publically visible Decks of a User (Public Decks owned or editable by the User)
 * @param user Username or User ID of the User
 * @returns Publically visible Decks of the User
 */
export async function getUserDecks(user: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user/decks/${user}`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch User Decks");
  });

  const decksData = await res.json() as ICustomResponse<ILessDeck[]>;
  if (!res?.ok)
    throw new Error(decksData.message || "Failed to fetch User Decks");

  return decksData.data;
}

/**
 * Makes a GET request to get the Liked Decks of the User (Logged in User only)
 * @returns Decks liked by the User
 */
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

import makeRequest from "./common";
import type { TUserDetailsFormSchema } from "@/types/forms";

/**
 * Makes a GET request to get the private details of the logged in User
 * @returns Details about the User
 */
export const getLoggedInUser = async () => {
  const response = await makeRequest<IUserPrivate>(
    "/user",
    "get",
    null,
    "Failed to get User details"
  );
  return response.data;
}

/**
 * Makes a GET request to get Information about a User
 * @param user Username or User ID of the User
 * @returns information about the User
 */
export const getUser = async (user: string) => {
  const response = await makeRequest<IUser>(
    `/user/get/${user}`,
    "get",
    null,
    "Failed to get User"
  );
  return response.data;
}

/**
 * Makes a GET request to get Users with the given substring in their Username
 * @param substring Substring to search for in the Usernames
 * @returns Users with the given substring in their Username
 */
export const getUserFromSubstring = async (substring: string) => {
  const response = await makeRequest<IUserWithID[]>(
    `/user/substr/${substring}`,
    "get",
    null,
    "No such User found"
  );
  return response.data;
}

/**
 * Makes a GET request to get the publicly visible Decks of a User (Public Decks owned or editable by the User)
 * @param user Username or User ID of the User
 * @returns Publicly visible Decks of the User
 */
export const getUserDecks = async (user: string) => {
  const response = await makeRequest<ILessDeck[]>(
    `/user/decks/${user}`,
    "get",
    null,
    "Failed to fetch User Decks"
  );
  return response.data;
}

/**
 * Makes a GET request to get the Liked Decks of the User (Logged in User only)
 * @returns Decks liked by the User
 */
export const getUserLikedDecks = async () => {
  const response = await makeRequest<ILessDeck[]>(
    "/user/liked",
    "get",
    null,
    "Failed to fetch Liked Decks"
  );
  return response.data;
}

/**
 * Makes a PATCH request to update the user details
 * @param data information about the user
 * @returns Message from the Server
 */
export async function updateUser(data: TUserDetailsFormSchema) {
  const response = await makeRequest<undefined>(
    "/user",
    "PATCH",
    data,
    "Failed to Edit User details"
  );
  return response.message;
}

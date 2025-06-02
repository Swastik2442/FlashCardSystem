import makeRequest from "@/api/common";
import fetchWithCredentials from "@/utils/fetch";
import type { TDeckFormSchema, TDeckShareFormSchema, TDeckOwnerFormSchema } from "@/types/forms";
import { UNCATEGORISED_DECK_NAME } from "@/constants";

/**
 * @param deck Deck to be checked
 * @returns Whether the Deck contains Uncategorised Cards
 */
export function isDeckUncategorised<T extends Pick<ILessDeck, "name">>(deck: T) {
  return deck.name === UNCATEGORISED_DECK_NAME;
}

/**
 * @param deck Deck to be checked
 * @returns Whether the Deck is Editable by the User
 */
export function isDeckEditable<T extends Pick<ILessDeck, "name"> | Pick<IMoreDeck, "name" | "isEditable">>(deck: T) {
  return isDeckUncategorised(deck) || ("isEditable" in deck && deck.isEditable);
}

/**
 * @param decks Decks to be checked
 * @returns Deck which contains Uncategorised Cards
 */
export function getUncategorisedDeck<T extends Pick<ILessDeck, "name">>(decks?: T[]): Nullable<T> {
  const uncat = decks?.find(isDeckUncategorised);
  if (!uncat) return null;
  return uncat;
}

export function sortDecks<T extends Pick<ILessDeck, "name" | "dateUpdated">>(decks: T[]): T[] {
  return decks.sort((a, b) => (
    (a.dateUpdated > b.dateUpdated) ||
    (a.dateUpdated === b.dateUpdated && a.name < b.name)
  ) ? -1 : 1);
}

export function sortCards<T extends Omit<ILessCard, "_id">>(cards: T[]): T[] {
  return cards.sort((a, b) => (
    (a.question > b.question) ||
    (a.question === b.question && a.answer > b.answer) ||
    (a.question === b.question && a.answer === b.answer && a.hint > b.hint)
  ) ? 1 : -1);
}

/**
 * Makes a GET request to fetch the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Information about the Deck
 */
export const getDeck = async (deckID: string) => {
  const response = await makeRequest<IMoreDeck>(
    `/deck/${deckID}`,
    "get",
    null,
    "Failed to fetch Deck"
  );
  return response.data;
}

/**
 * Makes a GET request to fetch all Decks owned by or shared to the User
 * @returns Decks owned by or shared to the User
 */
export const getAllDecks = async () => {
  const response = await makeRequest<ILessDeck[]>(
    "/deck/all",
    "get",
    null,
    "Failed to fetch Decks"
  );
  return response.data;
}

/**
 * Makes a GET request to fetch all Decks owned by or shared to the User
 * @returns Sorted Decks owned by or shared to the User
 */
export const getAllDecksSorted = async () => {
  return sortDecks(await getAllDecks());
}

/**
 * Makes a GET request to fetch all Cards in the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Cards in the Deck
 */
export const getDeckCards = async (deckID: string) => {
  const response = await makeRequest<ILessCard[]>(
    `/deck/cards/${deckID}`,
    "get",
    null,
    "Failed to fetch Deck's cards"
  );
  return response.data.map((v) => ({ ...v, deck: deckID } as ICard));
}

/**
 * Makes a GET request to fetch all Cards in the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Sorted Cards in the Deck
 */
export const getDeckCardsSorted = async (deckID: string) => {
  return sortCards(await getDeckCards(deckID));
}

/**
 * Makes a POST request to create a new Deck
 * @param data information of the deck
 * @returns ID of the created deck
 */
export const createDeck = async (data: TDeckFormSchema) => {
  const response = await makeRequest<string | null>(
    "/deck/new",
    "post",
    data,
    "Failed to Create a Deck"
  );
  return response.data;
}

/**
 * Makes a DELETE request to delete the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Message from the Server
 */
export const removeDeck = async (deckID: string) => {
  const response = await makeRequest<undefined>(
    `/deck/${deckID}`,
    "delete",
    null,
    "Failed to Delete the Deck"
  );
  return response.message;
}

/**
 * Makes a PATCH request to update the Deck with the given ID
 * @param deckID ID of the Deck
 * @param data information to be updated
 * @returns Message from the Server
 */
export const updateDeck = async (deckID: string, data: TDeckFormSchema) => {
  const response = await makeRequest<undefined>(
    `/deck/${deckID}`,
    "PATCH",
    data,
    "Failed to Edit the Deck"
  );
  return response.message;
}

/**
 * Makes a GET request to populate the Deck with the given ID with AI-generated Cards
 * @param deckID ID of the Deck
 * @returns Message from the Server or if Rate Limited, Date till Rate Limited
 */
export const populateDeck = async (deckID: string) => {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/populate/${deckID}`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Populate the Deck");
  });

  const data = await res.json() as ICustomResponse<string | undefined>;
  if (res.status == 429) {
    const retryAfter = res.headers.get("Retry-After")
    if (retryAfter)
      return new Date(new Date().getTime() + parseInt(retryAfter) * 1000);
    return;
  } else if (!res.ok)
    throw new Error(data.message || "Failed to Populate the Deck");

  return data?.data;
}

/**
 * Makes a POST request to like the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Message from the Server
 */
export const likeDeck = async (deckID: string) => {
  const response = await makeRequest<undefined>(
    `/deck/likes/add/${deckID}`,
    "post",
    null,
    "Failed to Like the Deck"
  );
  return response.message;
}

/**
 * Makes a POST request to unlike the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Message from the Server
 */
export const unlikeDeck = async (deckID: string) => {
  const response = await makeRequest<undefined>(
    `/deck/likes/remove/${deckID}`,
    "post",
    null,
    "Failed to Unlike the Deck"
  );
  return response.message;
}

/**
 * Makes a GET request to fetch the IDs of the Users with whom the Deck is shared
 * @returns User IDs of the Users with whom the Deck is shared
 */
export const getSharedWithUsers = async (deckID: string) => {
  const response = await makeRequest<{ user: string, isEditable: boolean }[]>(
    `/deck/share/${deckID}`,
    "get",
    null,
    "Failed to fetch Users"
  );
  return response.data;
}

/**
 * Makes a POST request to share/unshare the Deck with the given ID
 * @param deckID ID of the Deck
 * @param data information regarding the share/unshare
 * @returns Message from the Server
 */
export const shareDeck = async (deckID: string, data: TDeckShareFormSchema) => {
  const shareORunshare = data?.unshare ? "unshare" : "share";
  const response = await makeRequest<undefined>(
    `/deck/${shareORunshare}/${deckID}`,
    "post",
    { ...data, users: data.users.map(u => u._id) },
    `Failed to ${shareORunshare} the Deck`
  );
  return response.message;
}

/**
 * Makes a PATCH request to change the Deck's Owner
 * @param deckID ID of the Deck
 * @param data information regarding the new Owner
 * @returns Message from the Server
 */
export const changeDeckOwner = async (deckID: string, data: TDeckOwnerFormSchema) => {
  const response = await makeRequest<undefined>(
    `/deck/owner/${deckID}`,
    "PATCH",
    data,
    "Failed to change the Deck Owner"
  );
  return response.message;
}

import { getCSRFToken } from "@/api/auth";
import fetchWithCredentials from "@/utils/fetch";
import type { TDeckFormSchema, TDeckShareFormSchema } from "@/types/forms";

/**
 * @param deck Deck to be checked
 * @returns Whether the Deck contains Uncategorized Cards
 */
export function isDeckUncategorized(deck: ILessDeck | IMoreDeck) {
  return deck.name === "#UNCATEGORISED#";
}

/**
 * Makes a GET request to fetch the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Information about the Deck
 */
export async function getDeck(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch Deck");
  });

  const deckData = await res.json() as ICustomResponse<IMoreDeck>;
  if (!res?.ok)
    throw new Error(deckData.message || "Failed to fetch Deck");

  return deckData.data;
}

/**
 * Makes a GET request to fetch all Decks owned by or shared to the User
 * @returns Decks owned by or shared to the User
 */
export async function getAllDecks() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/all`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch Decks");
  });

  const allDecksData = await res.json() as ICustomResponse<ILessDeck[]>;
  if (!res?.ok)
    throw new Error(allDecksData.message || "Failed to fetch Decks");

  return allDecksData.data;
}

/**
 * Makes a GET request to fetch all Cards in the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Cards in the Deck
 */
export async function getDeckCards(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/cards/${deckID}`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to fetch Deck's cards");
  });

  const deckCardsData = await res.json() as ICustomResponse<ICard[]>;
  if (!res?.ok)
    throw new Error(deckCardsData.message || "Failed to fetch Deck's cards");

  return deckCardsData.data;
}

/**
 * Makes a POST request to create a new Deck
 * @param data information of the deck
 * @returns ID of the created deck
 */
export async function createDeck(data: TDeckFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/new`,
    "post",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Create a Deck");
  });

  const creationData = await res.json() as ICustomResponse<string | null>;
  if (!res?.ok)
    throw new Error(creationData.message || "Failed to Create a Deck");

  return creationData.data;
}

/**
 * Makes a DELETE request to delete the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns 
 */
export async function removeDeck(deckID: string) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "delete",
    null,
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Delete Deck");
  });

  const deletionData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(deletionData.message || "Failed to Delete Deck");

  return deletionData.message;
}

/**
 * Makes a PATCH request to update the Deck with the given ID
 * @param deckID ID of the Deck
 * @param data information to be updated
 * @returns Message from the Server
 */
export async function updateDeck(deckID: string, data: TDeckFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Edit the Deck");
  });

  const updateDeckData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(updateDeckData.message || "Failed to Edit the Deck");

  return updateDeckData.message;
}

/**
 * Makes a POST request to like the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Message from the Server
 */
export async function likeDeck(deckID: string) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/likes/add/${deckID}`,
    "post",
    null,
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to like deck");
  });

  const likeData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(likeData.message || "Failed to like deck");

  return likeData.message;
}

/**
 * Makes a POST request to unlike the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Message from the Server
 */
export async function unlikeDeck(deckID: string) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/likes/remove/${deckID}`,
    "post",
    null,
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to unlike deck");
  });

  const unlikeData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(unlikeData.message || "Failed to unlike deck");

  return unlikeData.message;
}

/**
 * Makes a POST request to share/unshare the Deck with the given ID
 * @param deckID ID of the Deck
 * @param data information regarding the share/unshare
 * @returns Message from the Server
 */
export async function shareDeck(deckID: string, data: TDeckShareFormSchema) {
  const shareORunshare = data?.unshare ? "unshare" : "share";
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${shareORunshare}/${deckID}`,
    "post",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || `Failed to ${shareORunshare} the Deck`);
  });

  const shareDeckData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(shareDeckData.message || `Failed to ${shareORunshare} the Deck`);

  return shareDeckData.message;
}

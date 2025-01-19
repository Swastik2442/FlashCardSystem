import makeRequest from "@/api/common";
import fetchWithCredentials from "@/utils/fetch";
import type { TDeckFormSchema, TDeckShareFormSchema, TDeckOwnerFormSchema } from "@/types/forms";
import { UNCATEGORISED_DECK_NAME } from "@/constants";

/**
 * @param deck Deck to be checked
 * @returns Whether the Deck contains Uncategorised Cards
 */
export const isDeckUncategorised = (deck: ILessDeck | IMoreDeck) => {
  return deck.name === UNCATEGORISED_DECK_NAME;
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
 * Makes a GET request to fetch all Cards in the Deck with the given ID
 * @param deckID ID of the Deck
 * @returns Cards in the Deck
 */
export const getDeckCards = async (deckID: string) => {
  const response = await makeRequest<ICard[]>(
    `/deck/cards/${deckID}`,
    "get",
    null,
    "Failed to fetch Deck's cards"
  );
  return response.data;
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
 * @returns Message from the Server
 */
export const populateDeck = async (deckID: string) => {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/populate/${deckID}`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Populate the Deck");
  });

  const data = await res.json() as ICustomResponse<string | undefined>;
  let returnData: Date | string | undefined = data?.data;

  if (res.status == 429) {
    if (typeof returnData == "string") {
      try {
        const rlDate = new Date(returnData);
        returnData = rlDate;
      } catch {
        returnData = "RATELIMITED";
      }
    } else
      returnData = returnData ?? "RATELIMITED";
  }
  else if (!res.ok)
    throw new Error(data.message || "Failed to Populate the Deck");

  return returnData;
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
    data,
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

import fetchWithCredentials from "@/utils/fetch";
import type { TDeckFormSchema, TDeckShareFormSchema } from "@/types/forms";

export function isDeckUncategorized(deck: ILessDeck | IMoreDeck) {
  return deck.name === "#UNCATEGORISED#";
}

export async function getDeck(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch Deck");

  const deckData = await res.json() as ICustomResponse<IMoreDeck>;
  return deckData.data;
}

export async function getAllDecks() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/all`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Decks");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch Decks");

  const allDecksData = await res.json() as ICustomResponse<ILessDeck[]>;
  return allDecksData.data;
}

export async function getDeckCards(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/cards/${deckID}`,
    "get"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to fetch Deck's cards");
  });
  if (!res?.ok)
    throw new Error("Failed to fetch Deck's cards");

  const deckCardsData = await res.json() as ICustomResponse<ICard[]>;
  return deckCardsData.data;
}

export async function createDeck(data: TDeckFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/new`,
    "post",
    JSON.stringify(data),
  ).catch((err: Error) => {
    console.error(err.message || "Failed to Create a Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to Create a Deck");

  const creationData = await res.json() as ICustomResponse<string | null>;
  return creationData.data;
}

export async function removeDeck(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "delete"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to Delete Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to Delete Deck");

  const deletionData = await res.json() as ICustomResponse<undefined>;
  return deletionData.message;
}

export async function updateDeck(deckID: string, data: TDeckFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/${deckID}`,
    "PATCH",
    JSON.stringify(data),
  ).catch((err: Error) => {
    console.error(err?.message || "Failed to Edit the Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to Edit the Deck");

  const updateDeckData = await res.json() as ICustomResponse<undefined>;
  return updateDeckData.message;
}

export async function likeDeck(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/likes/add/${deckID}`,
    "post"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to like deck");
  });
  if (!res?.ok)
    throw new Error("Failed to like deck");

  const likeData = await res.json() as ICustomResponse<undefined>;
  return likeData.message;
}

export async function unlikeDeck(deckID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/likes/remove/${deckID}`,
    "post"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to unlike deck");
  });
  if (!res?.ok)
    throw new Error("Failed to unlike deck");

  const unlikeData = await res.json() as ICustomResponse<undefined>;
  return unlikeData.message;
}

export async function shareDeck(deckID: string, data: TDeckShareFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/deck/share/${deckID}`,
    "post",
    JSON.stringify(data),
  ).catch((err: Error) => {
    console.error(err?.message || "Failed to Share the Deck");
  });
  if (!res?.ok)
    throw new Error("Failed to Share the Deck");

  // TODO: Switch to unshare url when unshare is defined

  const shareDeckData = await res.json() as ICustomResponse<undefined>;
  return shareDeckData.message;
}

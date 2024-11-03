import { getCSRFToken } from "@/api/auth";
import fetchWithCredentials from "@/utils/fetch";
import type { TCardFormSchema } from "@/types/forms";

/**
 * Makes a POST request to create a new card
 * @param data information of the card
 * @returns ID of the created card
 */
export async function createCard(data: TCardFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/new`,
    "post",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Create a Card");
  });

  const cardData = await res.json() as ICustomResponse<ICard>;
  if (!res?.ok)
    throw new Error(cardData.message || "Failed to Create a Card");

  return cardData.data;
}

/**
 * Makes a PATCH request to update the card with the given ID
 * @param cardID ID of the card
 * @param data information to be updated
 * @returns Message from the Server
 */
export async function updateCard(cardID: string, data: TCardFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Edut the Card");
  });

  const cardUpdateData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(cardUpdateData.message || "Failed to Edit the Card");

  return cardUpdateData.message;
}

/**
 * Makes a DELETE request to delete the card with the given ID
 * @param cardID ID of the card
 * @returns Message from the Server
 */
export async function removeCard(cardID: string) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "delete",
    null,
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Delete the Card");
  });

  const cardDeleteData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(cardDeleteData.message || "Failed to Delete the Card");

  return cardDeleteData.message;
}

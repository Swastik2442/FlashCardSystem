import makeRequest from "@/api/common";
import fetchWithCredentials from "@/utils/fetch";
import type { TCardFormSchema } from "@/types/forms";

/**
 * Makes a POST request to create a new card
 * @param data information of the card
 * @returns ID of the created card
 */
export const createCard = async (data: TCardFormSchema) => {
  const response = await makeRequest<string | null>(
    "/card/new",
    "post",
    data,
    "Failed to Create a Card"
  );
  return response.data;
}

/**
 * Makes a PATCH request to update the card with the given ID
 * @param cardID ID of the card
 * @param data information to be updated
 * @returns Message from the Server
 */
export const updateCard = async (cardID: string, data: TCardFormSchema) => {
  const response = await makeRequest<undefined>(
    `/card/${cardID}`,
    "PATCH",
    data,
    "Failed to Edit the Card"
  );
  return response.message;
}

/**
 * Makes a GET request to populate the card with the given ID with AI-generated content
 * @param cardID ID of the card
 * @returns Data for the Populated Card or if Rate Limited, Date till Rate Limited
 */
export const populateCard = async (cardID: string) => {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/populate/${cardID}`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Populate the Card");
  });

  const data = await res.json() as ICustomResponse<Omit<ILessCard, "_id"> | undefined>;
  if (res.status == 429) {
    const retryAfter = res.headers.get("retry-after")
    if (retryAfter)
      return new Date(new Date().getTime() + parseInt(retryAfter));
    return;
  } else if (!res.ok)
    throw new Error(data.message || "Failed to Populate the Card");

  return data?.data;
}

/**
 * Makes a DELETE request to delete the card with the given ID
 * @param cardID ID of the card
 * @returns Message from the Server
 */
export const removeCard = async (cardID: string) => {
  const response = await makeRequest<undefined>(
    `/card/${cardID}`,
    "delete",
    null,
    "Failed to Delete the Card"
  );
  return response.message;
}

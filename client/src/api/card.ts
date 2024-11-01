import fetchWithCredentials from "@/utils/fetch";
import type { TCardFormSchema } from "@/types/forms";

export async function createCard(data: TCardFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/new`,
    "post",
    JSON.stringify(data),
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Create a Card");
  });

  const cardData = await res.json() as ICustomResponse<ICard>;
  if (!res?.ok)
    throw new Error(cardData.message || "Failed to Create a Card");

  return cardData.data;
}

export async function updateCard(cardID: string, data: TCardFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "PATCH",
    JSON.stringify(data),
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Edut the Card");
  });

  const cardUpdateData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(cardUpdateData.message || "Failed to Edit the Card");

  return cardUpdateData.message;
}

export async function removeCard(cardID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "delete"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Delete the Card");
  });

  const cardDeleteData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(cardDeleteData.message || "Failed to Delete the Card");

  return cardDeleteData.message;
}

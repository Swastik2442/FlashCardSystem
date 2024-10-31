import fetchWithCredentials from "@/utils/fetch";
import type { TCardFormSchema } from "@/types/forms";

export async function createCard(data: TCardFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/new`,
    "post",
    JSON.stringify(data),
  ).catch((err: Error) => {
    console.log(err.message || "Failed to Create a Card");
  });
  if (!res?.ok)
    throw new Error("Failed to Create a Card");

  const cardData = await res.json() as ICustomResponse<ICard>;
  return cardData.data;
}

export async function updateCard(cardID: string, data: TCardFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "PATCH",
    JSON.stringify(data),
  ).catch((err: Error) => {
    console.error(err?.message || "Failed to Edut the Card");
  });
  if (!res?.ok)
    throw new Error("Failed to Edit the Card");

  const cardUpdateData = await res.json() as ICustomResponse<undefined>;
  return cardUpdateData.message;
}

export async function removeCard(cardID: string) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/card/${cardID}`,
    "delete"
  ).catch((err: Error) => {
    console.error(err.message || "Failed to Delete the Card");
  });
  if (!res?.ok)
    throw new Error("Failed to Delete the Card");

  const cardDeleteData = await res.json() as ICustomResponse<undefined>;
  return cardDeleteData.message;
}

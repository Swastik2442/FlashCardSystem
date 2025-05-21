import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getAllDecksSorted,
  getDeck,
  getDeckCardsSorted,
  getUncategorisedDeck
} from "@/api/deck"
import {
  getAllDecksQueryKey,
  getDeckQueryKey,
  getDeckCardsQueryKey,
  UNCATEGORISED_DECK_NAME,
} from "@/constants"
import { useUserQuery } from "./userQueries"

export function useAllDecksQuery<TSelected = ILessDeck[]>(
  select?: (data: ILessDeck[]) => TSelected
) {
  return useQuery({
    queryKey: getAllDecksQueryKey(),
    queryFn: async () => await getAllDecksSorted(),
    select
  })
}

// Make the uncatDeckID as not null (Context/Cache thing?)
export function useUncatDeckQuery<TSelected = Nullable<ILessDeck>>(
  select?: (data: Nullable<ILessDeck>) => TSelected
) {
  const decksQuery = useAllDecksQuery()
  const uncatDeckID = useMemo(() => {
    if (!decksQuery.data) return null

    const uncatDeck = getUncategorisedDeck(decksQuery.data)
    return uncatDeck?._id ?? UNCATEGORISED_DECK_NAME
  }, [decksQuery.data])

  return useQuery({
    queryKey: getDeckQueryKey(uncatDeckID!),
    queryFn: () => getUncategorisedDeck(decksQuery.data),
    enabled: !!decksQuery.data,
    select
  })
}

export function useDeckQuery<TSelected = IMoreDeck>(
  deckID?: string,
  select?: (data: IMoreDeck) => TSelected
) {
  return useQuery({
    queryKey: getDeckQueryKey(deckID!),
    queryFn: async () => await getDeck(deckID!),
    enabled: !!deckID,
    select
  })
}

export function useDeckCardsQuery<TSelected = ICard[]>(
  deckID?: string,
  select?: (data: ICard[]) => TSelected
) {
  return useQuery({
    queryKey: getDeckCardsQueryKey(deckID!),
    queryFn: async () => await getDeckCardsSorted(deckID!),
    enabled: !!deckID,
    select
  })
}

export function useDeckOwnerQuery<TSelected = IUser>(
  deckID?: string,
  select?: (data: IUser) => TSelected
) {
  const deckQuery = useDeckQuery(deckID)
  return useUserQuery(deckQuery.data?.owner, select)
}

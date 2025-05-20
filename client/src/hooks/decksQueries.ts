import { useQuery } from "@tanstack/react-query"
import {
  getAllDecksSorted,
  getDeck,
  getDeckCardsSorted,
  getUncategorisedDeck
} from "@/api/deck"
import { getUser } from "@/api/user"
import {
  getAllDecksQueryKey,
  getUncatDeckQueryKey,
  getDeckQueryKey,
  getDeckCardsQueryKey,
  getDeckOwnerQueryKey
} from "@/constants"

export function useAllDecksQuery<TSelected = ILessDeck[]>(
  select?: (data: ILessDeck[]) => TSelected
) {
  return useQuery({
    queryKey: getAllDecksQueryKey(),
    queryFn: async () => await getAllDecksSorted(),
    select
  })
}

export function useUncatDeckQuery<TSelected = Nullable<ILessDeck>>(
  select?: (data: Nullable<ILessDeck>) => TSelected
) {
  const decksQuery = useAllDecksQuery()
  return useQuery({
    queryKey: getUncatDeckQueryKey(),
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
  return useQuery({
    queryKey: getDeckOwnerQueryKey(deckID!),
    queryFn: () => getUser(deckQuery.data!.owner),
    enabled: !!deckQuery.data?.owner,
    select
  })
}

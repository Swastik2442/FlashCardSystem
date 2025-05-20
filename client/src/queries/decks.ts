import { useQuery } from "@tanstack/react-query"
import { getAllDecksSorted, getDeck, getDeckCardsSorted, getUncategorisedDeck } from "@/api/deck"
import { ALL_DECKS_QUERY_KEY, CARDS_QUERY_KEY, DECK_QUERY_KEY, UNCATEGORISED_DECK_NAME } from "@/constants"

export function useAllDecksQuery<TSelected = ILessDeck[]>(
  select?: (data: ILessDeck[]) => TSelected
) {
  return useQuery({
    queryKey: [ALL_DECKS_QUERY_KEY],
    queryFn: async () => await getAllDecksSorted(),
    select
  })
}

export function useUncatDeckQuery<TSelected = Nullable<ILessDeck>>(
  select?: (data: Nullable<ILessDeck>) => TSelected
) {
  const decksQuery = useAllDecksQuery()
  return useQuery({
    queryKey: [DECK_QUERY_KEY, UNCATEGORISED_DECK_NAME],
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
    queryKey: [DECK_QUERY_KEY, deckID],
    queryFn: async () => await getDeck(deckID!),
    enabled: !!deckID,
    select
  })
}

export const getDeckCardsQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID, CARDS_QUERY_KEY]
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

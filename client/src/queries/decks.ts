import { getAllDecksSorted, getDeck, getDeckCardsSorted, getUncategorisedDeck } from "@/api/deck"
import { ALL_DECKS_QUERY_KEY, CARDS_QUERY_KEY, DECK_QUERY_KEY, UNCATEGORISED_DECK_NAME } from "@/constants"
import { useQuery } from "@tanstack/react-query"

export function useAllDecksQuery() {
  return useQuery({
    queryKey: [ALL_DECKS_QUERY_KEY],
    queryFn: async () => await getAllDecksSorted()
  })
}

export function useUncatDeckQuery() {
  const decksQuery = useAllDecksQuery()
  return useQuery({
    queryKey: [DECK_QUERY_KEY, UNCATEGORISED_DECK_NAME],
    queryFn: () => getUncategorisedDeck(decksQuery.data),
    enabled: !!decksQuery.data
  })
}

export function useDeckQuery(deckID?: string) {
  return useQuery({
    queryKey: [DECK_QUERY_KEY, deckID],
    queryFn: async () => await getDeck(deckID!),
    enabled: !!deckID
  })
}

export function useDeckCardsQuery(deckID?: string) {
  return useQuery({
    queryKey: [DECK_QUERY_KEY, deckID, CARDS_QUERY_KEY],
    queryFn: async () => await getDeckCardsSorted(deckID!),
    enabled: !!deckID
  })
}

export const USER_STORAGE_KEY = "fcs-user"
export const THEME_STORAGE_KEY = "fcs-ui-theme"
export const SEARCH_USERS_STORAGE_KEY = "fcs-search-users"

export const UNCATEGORISED_DECK_NAME = "#UNCATEGORISED#"
export const ALL_DECKS_QUERY_KEY = "decks"
export const DECK_QUERY_KEY = "deck"
export const CARDS_QUERY_KEY = "cards"
export const USER_QUERY_KEY = "user"

export const getAllDecksQueryKey = () => [ALL_DECKS_QUERY_KEY]
export const getUncatDeckQueryKey = () => [DECK_QUERY_KEY, UNCATEGORISED_DECK_NAME]

export const getDeckQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID]
}

export const getDeckCardsQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID, CARDS_QUERY_KEY]
}

export const getDeckOwnerQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID, USER_QUERY_KEY]
}

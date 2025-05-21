export const USER_STORAGE_KEY = "fcs-user"
export const THEME_STORAGE_KEY = "fcs-ui-theme"
export const SEARCH_USERS_STORAGE_KEY = "fcs-search-users"

export const UNCATEGORISED_DECK_NAME = "#UNCATEGORISED#"
export const FCS_QUERY_KEY = "fcs"
export const ROLES_QUERY_KEY = "roles"
export const ALL_DECKS_QUERY_KEY = "decks"
export const DECK_QUERY_KEY = "deck"
export const CARDS_QUERY_KEY = "cards"
export const USER_QUERY_KEY = "user"
export const LIKED_QUERY_KEY = "liked"

export const getAllDecksQueryKey = () => [ALL_DECKS_QUERY_KEY]

export const getDeckQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID]
}

export const getDeckCardsQueryKey = (deckID: string) => {
  return [DECK_QUERY_KEY, deckID, CARDS_QUERY_KEY]
}

export const getUserQueryKey = (userID?: string) => {
  if (!userID) return [USER_QUERY_KEY]
  return [USER_QUERY_KEY, userID]
}

export const getUserDecksQueryKey = (userID: string) => {
  return [USER_QUERY_KEY, userID, ALL_DECKS_QUERY_KEY]
}

export const getUserLikedDecksQueryKey = (userID: string) => {
  return [USER_QUERY_KEY, userID, LIKED_QUERY_KEY, ALL_DECKS_QUERY_KEY]
}

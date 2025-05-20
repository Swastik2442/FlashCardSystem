import { useQuery } from "@tanstack/react-query"
import { getUser, getUserDecks, getUserLikedDecks } from "@/api/user"
import { getUserDecksQueryKey, getUserLikedDecksQueryKey, getUserQueryKey } from "@/constants"

export function useUserQuery<TSelected = IUser>(
  userID?: string,
  select?: (data: IUser) => TSelected
) {
  return useQuery({
    queryKey: getUserQueryKey(userID!),
    queryFn: () => getUser(userID!),
    enabled: !!userID,
    select
  })
}

export function useUserDecksQuery<TSelected = ILessDeck[]>(
  userID?: string,
  select?: (data: ILessDeck[]) => TSelected
) {
  return useQuery({
    queryKey: getUserDecksQueryKey(userID!),
    queryFn: () => getUserDecks(userID!),
    enabled: !!userID,
    select
  })
}

export function useUserLikedDecksQuery<TSelected = ILessDeck[]>(
  userID?: string,
  select?: (data: ILessDeck[]) => TSelected
) {
  return useQuery({
    queryKey: getUserLikedDecksQueryKey(userID!),
    queryFn: () => getUserLikedDecks(userID!),
    enabled: !!userID,
    select
  })
}

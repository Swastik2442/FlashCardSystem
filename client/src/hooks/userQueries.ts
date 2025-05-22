import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/authProvider"
import {
  getLoggedInUser,
  getUser,
  getUserDecks,
  getUserLikedDecks
} from "@/api/user"
import {
  getUserDecksQueryKey,
  getUserLikedDecksQueryKey,
  getUserQueryKey
} from "@/constants"

export function useUserQuery<TSelected = IUser>(
  userID?: string,
  select?: (data: IUser) => TSelected
) {
  return useQuery({
    // Required otherwise it will overwrite current/logged in user query key
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    queryKey: getUserQueryKey(userID!),
    queryFn: () => getUser(userID!),
    enabled: !!userID,
    select
  })
}

export function useCurrentUserQuery<TSelected = IUserPrivate>(
  select?: (data: IUserPrivate) => TSelected
) {
  const { user } = useAuth()
  return useQuery({
    queryKey: getUserQueryKey(),
    queryFn: getLoggedInUser,
    enabled: !!user,
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

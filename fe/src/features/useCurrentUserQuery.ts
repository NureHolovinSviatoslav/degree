import { useQuery, useQueryClient } from "react-query";
import { fetchAbstract } from "../utils/fetchAbstract";
import { User, UserRole } from "../types/User";
import { toEnum } from "../utils/toEnum";

export const CURRENT_USER_QUERY_KEY = "me";

export const useCurrentUserQuery = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CURRENT_USER_QUERY_KEY],
    queryFn: async () => {
      const user = (await fetchAbstract(
        { queryClient },
        {
          preventUnauthorizedReset: true,
        },
        "users/me",
        "GET",
      )) as User;

      return {
        ...user,
        role: toEnum(user.role ?? "", UserRole) || null,
      } as User;
    },
  });
};

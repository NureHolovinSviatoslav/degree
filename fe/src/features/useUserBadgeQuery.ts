import { useQuery, useQueryClient } from "react-query";
import { UserBadge } from "../types/UserBadge";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useUserBadgeQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["user-badges", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `user-badges${id ? `/${id}` : ""}`,
        "GET",
      )) as UserBadge[] | UserBadge;

      return Array.isArray(data) ? data : [data];
    },
  });
};

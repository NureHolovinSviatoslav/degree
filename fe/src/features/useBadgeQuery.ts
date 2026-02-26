import { useQuery, useQueryClient } from "react-query";
import { Badge } from "../types/Badge";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useBadgeQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["badges", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `badges${id ? `/${id}` : ""}`,
        "GET",
      )) as Badge[] | Badge;

      return Array.isArray(data) ? data : [data];
    },
  });
};

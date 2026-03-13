import { useQuery, useQueryClient } from "react-query";
import { ActivityStreak } from "../types/ActivityStreak";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useActivityStreakQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["activity-streaks", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `activity-streaks${id ? `/${id}` : ""}`,
        "GET",
      )) as ActivityStreak[] | ActivityStreak;

      return Array.isArray(data) ? data : [data];
    },
  });
};

import { useQuery, useQueryClient } from "react-query";
import { GamificationSettings } from "../types/GamificationSettings";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useGamificationSettingsQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["gamification-settings", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `gamification-settings${id ? `/${id}` : ""}`,
        "GET",
      )) as GamificationSettings[] | GamificationSettings;

      return Array.isArray(data) ? data : [data];
    },
  });
};

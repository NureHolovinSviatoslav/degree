import { useQuery, useQueryClient } from "react-query";
import { LocationItem } from "../types/LocationItem";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useLocationItemQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["location_item", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `locationItems${id ? `/${id}` : ""}`,
        "GET",
      )) as LocationItem[] | LocationItem;

      return Array.isArray(data) ? data : [data];
    },
  });
};

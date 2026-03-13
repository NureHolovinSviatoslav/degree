import { useQuery, useQueryClient } from "react-query";
import { Location } from "../types/Location";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useLocationQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `locations${id ? `/${id}` : ""}`,
        "GET",
      )) as Location[] | Location;

      return Array.isArray(data) ? data : [data];
    },
  });
};

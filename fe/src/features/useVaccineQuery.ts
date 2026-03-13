import { useQuery, useQueryClient } from "react-query";
import { Vaccine } from "../types/Vaccine";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useVaccineQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["vaccine", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `vaccines${id ? `/${id}` : ""}`,
        "GET",
      )) as Vaccine[] | Vaccine;

      return Array.isArray(data) ? data : [data];
    },
  });
};

import { useQuery, useQueryClient } from "react-query";
import { Report } from "../types/Report";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useReportQuery = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `locations/${id}/report`,
        "GET",
      )) as Report;

      return data;
    },
  });
};

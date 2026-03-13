import { useQuery, useQueryClient } from "react-query";
import { Lesson } from "../types/Lesson";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useLessonQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `lessons${id ? `/${id}` : ""}`,
        "GET",
      )) as Lesson[] | Lesson;

      return Array.isArray(data) ? data : [data];
    },
  });
};

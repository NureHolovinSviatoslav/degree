import { useQuery, useQueryClient } from "react-query";
import { LessonProgress } from "../types/LessonProgress";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useLessonProgressQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["lesson-progress", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `lesson-progress${id ? `/${id}` : ""}`,
        "GET",
      )) as LessonProgress[] | LessonProgress;

      return Array.isArray(data) ? data : [data];
    },
  });
};

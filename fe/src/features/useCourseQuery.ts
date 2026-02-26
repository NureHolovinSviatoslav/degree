import { useQuery, useQueryClient } from "react-query";
import { Course } from "../types/Course";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useCourseQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `courses${id ? `/${id}` : ""}`,
        "GET",
      )) as Course[] | Course;

      return Array.isArray(data) ? data : [data];
    },
  });
};

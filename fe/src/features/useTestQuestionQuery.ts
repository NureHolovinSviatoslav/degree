import { useQuery, useQueryClient } from "react-query";
import { TestQuestion } from "../types/TestQuestion";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useTestQuestionQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["test-questions", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `test-questions${id ? `/${id}` : ""}`,
        "GET",
      )) as TestQuestion[] | TestQuestion;

      return Array.isArray(data) ? data : [data];
    },
  });
};

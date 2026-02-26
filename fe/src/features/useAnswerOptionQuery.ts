import { useQuery, useQueryClient } from "react-query";
import { AnswerOption } from "../types/AnswerOption";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useAnswerOptionQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["answer-options", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `answer-options${id ? `/${id}` : ""}`,
        "GET",
      )) as AnswerOption[] | AnswerOption;

      return Array.isArray(data) ? data : [data];
    },
  });
};

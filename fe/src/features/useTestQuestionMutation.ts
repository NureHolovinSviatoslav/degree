import { useMutation, useQueryClient } from "react-query";
import { TestQuestion } from "../types/TestQuestion";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useTestQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: TestQuestion }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `test-questions${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as TestQuestion;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("test-questions");
      },
    },
  );
};

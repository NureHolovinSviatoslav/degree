import { useMutation, useQueryClient } from "react-query";
import { AnswerOption } from "../types/AnswerOption";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useAnswerOptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: AnswerOption }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `answer-options${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as AnswerOption;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("answer-options");
      },
    },
  );
};

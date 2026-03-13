import { useMutation, useQueryClient } from "react-query";
import { LessonProgress } from "../types/LessonProgress";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useLessonProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: LessonProgress }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `lesson-progress${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as LessonProgress;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("lesson-progress");
      },
    },
  );
};

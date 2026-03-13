import { useMutation, useQueryClient } from "react-query";
import { Lesson } from "../types/Lesson";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useLessonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Lesson }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `lessons${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Lesson;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("lessons");
      },
    },
  );
};

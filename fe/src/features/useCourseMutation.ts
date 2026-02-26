import { useMutation, useQueryClient } from "react-query";
import { Course } from "../types/Course";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Course }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `courses${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Course;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("courses");
      },
    },
  );
};

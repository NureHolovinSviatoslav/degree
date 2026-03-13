import { useMutation, useQueryClient } from "react-query";
import { Enrollment } from "../types/Enrollment";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useEnrollmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Enrollment }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `enrollments${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Enrollment;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("enrollments");
      },
    },
  );
};

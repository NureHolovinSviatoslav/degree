import { useMutation, useQueryClient } from "react-query";
import { Badge } from "../types/Badge";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useBadgeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Badge }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `badges${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Badge;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("badges");
      },
    },
  );
};

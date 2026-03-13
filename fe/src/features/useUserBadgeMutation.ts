import { useMutation, useQueryClient } from "react-query";
import { UserBadge } from "../types/UserBadge";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useUserBadgeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: UserBadge }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `user-badges${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as UserBadge;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("user-badges");
      },
    },
  );
};

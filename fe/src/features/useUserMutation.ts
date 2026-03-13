import { useMutation, useQueryClient } from "react-query";

import { User } from "../types/User";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUserQuery";

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: User }
      | { type: "delete"; data: { username: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `users${type !== "create" ? `/${data.username}` : ""}`,
        typeToMethod[type],
        data,
      )) as User;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CURRENT_USER_QUERY_KEY);
        queryClient.resetQueries("users");
      },
    },
  );
};

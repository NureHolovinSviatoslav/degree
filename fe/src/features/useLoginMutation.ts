import { useMutation, useQueryClient } from "react-query";

import { Login } from "../types/Login";
import { fetchAbstract } from "../utils/fetchAbstract";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUserQuery";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: Login) => {
      const jwt = (
        await fetchAbstract({ queryClient }, {}, "users/login", "POST", data)
      ).accessToken;
      localStorage.setItem("jwt", jwt);
      return null;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
      },
    },
  );
};

import { useMutation, useQueryClient } from "react-query";
import { Register } from "../types/Register";
import { fetchAbstract } from "../utils/fetchAbstract";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUserQuery";

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: Register) => {
      const { accessToken } = await fetchAbstract(
        { queryClient },
        {},
        "users/register",
        "POST",
        data,
      );
      localStorage.setItem("jwt", accessToken);
      return null;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
      },
    },
  );
};

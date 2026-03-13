import { useMutation, useQueryClient } from "react-query";
import { ActivityStreak } from "../types/ActivityStreak";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useActivityStreakMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: ActivityStreak }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `activity-streaks${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as ActivityStreak;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("activity-streaks");
      },
    },
  );
};

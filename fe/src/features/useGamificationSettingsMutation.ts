import { useMutation, useQueryClient } from "react-query";
import { GamificationSettings } from "../types/GamificationSettings";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useGamificationSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: GamificationSettings }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `gamification-settings${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as GamificationSettings;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("gamification-settings");
      },
    },
  );
};

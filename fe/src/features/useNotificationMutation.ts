import { useMutation, useQueryClient } from "react-query";
import { Notification } from "../types/Notification";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Notification }
      | { type: "delete"; data: { id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `notifications${type !== "create" ? `/${data.id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Notification;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("notifications");
      },
    },
  );
};

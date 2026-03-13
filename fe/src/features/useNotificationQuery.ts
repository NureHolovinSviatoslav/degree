import { useQuery, useQueryClient } from "react-query";
import { Notification } from "../types/Notification";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useNotificationQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["notification", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `notifications${id ? `/${id}` : ""}`,
        "GET",
      )) as Notification[] | Notification;

      return Array.isArray(data) ? data : [data];
    },
  });
};

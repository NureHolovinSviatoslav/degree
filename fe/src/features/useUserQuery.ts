import { useQuery, useQueryClient } from "react-query";
import { fetchAbstract } from "../utils/fetchAbstract";
import { User, UserRole } from "../types/User";
import { toEnum } from "../utils/toEnum";

export const useUserQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `users${id ? `/${id}` : ""}`,
        "GET",
      )) as User[] | User;
      const users = Array.isArray(data) ? data : [data];

      return users.map((user) => ({
        ...user,
        role: toEnum(user.role ?? "", UserRole) || null,
      })) as User[];
    },
  });
};

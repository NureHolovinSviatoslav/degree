import { useQuery, useQueryClient } from "react-query";
import { fetchAbstract } from "../utils/fetchAbstract";
import { User, UserRole } from "../types/User";
import { toEnum } from "../utils/toEnum";

export const CURRENT_USER_QUERY_KEY = "me";

function parseJwtPayload(token: string): { id: string; role: string } | null {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const useCurrentUserQuery = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CURRENT_USER_QUERY_KEY],
    queryFn: async () => {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw new Error("Not authenticated");

      const payload = parseJwtPayload(jwt);
      if (!payload?.id) throw new Error("Invalid token");

      const user = (await fetchAbstract(
        { queryClient },
        { preventUnauthorizedReset: true },
        `users/${payload.id}`,
        "GET",
      )) as User;

      return {
        ...user,
        role: toEnum(user.role ?? "", UserRole) || null,
      } as User;
    },
  });
};

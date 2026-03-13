import { QueryClient } from "react-query";
import { CURRENT_USER_QUERY_KEY } from "../features/useCurrentUserQuery";

export const fetchAbstract = async <T>(
  context: {
    queryClient: QueryClient;
  },
  options: {
    preventUnauthorizedReset?: boolean;
  },
  urlPart: string,
  method: string,
  body?: T,
) => {
  const { queryClient } = context;
  const { preventUnauthorizedReset = false } = options;

  const response = await fetch(
    `${await import.meta.env.VITE_BE_URL}${urlPart}/`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    if (response.status === 401 && !preventUnauthorizedReset) {
      localStorage.removeItem("jwt");
      queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
    }

    const text = await response.text();

    if (text === "Token verification failed") {
      localStorage.removeItem("jwt");
      queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
    }

    throw new Error(await response.text());
  }

  try {
    return await response.json();
  } catch (error) {
    console.log(error);
    return {};
  }
};

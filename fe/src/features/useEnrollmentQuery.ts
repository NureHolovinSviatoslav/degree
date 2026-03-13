import { useQuery, useQueryClient } from "react-query";
import { Enrollment } from "../types/Enrollment";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useEnrollmentQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["enrollments", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `enrollments${id ? `/${id}` : ""}`,
        "GET",
      )) as Enrollment[] | Enrollment;

      return Array.isArray(data) ? data : [data];
    },
  });
};

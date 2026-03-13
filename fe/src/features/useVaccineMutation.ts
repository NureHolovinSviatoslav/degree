import { useMutation, useQueryClient } from "react-query";

import { Vaccine } from "../types/Vaccine";
import { fetchAbstract } from "../utils/fetchAbstract";
import { typeToMethod } from "../utils/typeToMethod";

export const useVaccineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      type,
      data,
    }:
      | { type: "create" | "update"; data: Vaccine }
      | { type: "delete"; data: { vaccine_id: string } }) => {
      return (await fetchAbstract(
        { queryClient },
        {},
        `vaccines${type !== "create" ? `/${data.vaccine_id}` : ""}`,
        typeToMethod[type],
        data,
      )) as Vaccine;
    },
    {
      onSuccess: () => {
        queryClient.resetQueries("vaccine");
      },
    },
  );
};

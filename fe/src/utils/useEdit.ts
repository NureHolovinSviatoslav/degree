import { useEffect, useMemo } from "react";
import { UseQueryResult } from "react-query";
import { useParams } from "react-router-dom";

export const useEdit = <TData extends Array<unknown>>(
  useQuery: (id?: string) => UseQueryResult<TData, unknown>,
  setError: (error: string) => void,
) => {
  const id = useParams().id;
  const isEdit = Boolean(id);
  const query = useQuery(id);

  useEffect(() => {
    if (query.isError) {
      setError((query.error as Error)?.message || "Unknown error");
    }
  }, [query.isError, query.error, setError]);

  return useMemo(
    () => ({
      id,
      isEdit,
      values: isEdit ? (query.data?.[0] as TData[0]) : undefined,
      isLoading: isEdit ? query.isLoading : false,
    }),
    [id, isEdit, query.data, query.isLoading],
  );
};

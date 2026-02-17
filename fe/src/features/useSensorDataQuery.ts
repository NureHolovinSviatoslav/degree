import { useQuery, useQueryClient } from "react-query";
import { SensorData } from "../types/SensorData";
import { fetchAbstract } from "../utils/fetchAbstract";

export const useSensorDataQuery = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["sensor_data", id],
    queryFn: async () => {
      const data = (await fetchAbstract(
        { queryClient },
        {},
        `sensorData${id ? `/${id}` : ""}`,
        "GET",
      )) as SensorData[] | SensorData;

      return Array.isArray(data) ? data : [data];
    },
  });
};

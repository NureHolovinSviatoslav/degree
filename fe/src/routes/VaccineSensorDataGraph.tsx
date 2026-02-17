/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { ScatterChart } from "@mui/x-charts";
import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import { useLocationItemQuery } from "../features/useLocationItemQuery";
import { useSensorDataQuery } from "../features/useSensorDataQuery";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { ChartSettings, getChartSettings } from "../utils/getChartSettings";

export const VaccineSensorDataGraph = () => {
  const [vaccineId, setVaccineId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const locationItemQuery = useLocationItemQuery();
  const vaccineQuery = useVaccineQuery();
  const sensorDataQuery = useSensorDataQuery();

  const sensorData = useMemo(
    () => sensorDataQuery.data || [],
    [sensorDataQuery.data],
  );
  const locationItems = useMemo(
    () => locationItemQuery.data || [],
    [locationItemQuery.data],
  );
  const vaccines = useMemo(() => vaccineQuery.data || [], [vaccineQuery.data]);

  const sensorDataWithVaccine = useMemo(() => {
    return sensorData.map((data) => {
      const locationItemList = locationItems.filter(
        (locationItem) => locationItem.location_id === data.location_id,
      );

      const vaccineList = vaccines.filter(
        (vaccine) =>
          locationItemList.find(
            (locationItem) => locationItem.vaccine_id === vaccine.vaccine_id,
          )?.vaccine_id === vaccine.vaccine_id,
      );

      return {
        ...data,
        vaccines: vaccineList,
      };
    });
  }, [sensorData, locationItems, vaccines]);

  const data = useMemo(() => {
    if (!vaccineId) {
      return [];
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return sensorDataWithVaccine
      .filter((data) => {
        const dataDate = new Date(data.updated_at);

        return (
          data.vaccines.find((vaccine) => vaccine.vaccine_id === vaccineId)
            ?.vaccine_id === vaccineId &&
          dataDate.getFullYear() === currentYear &&
          dataDate.getMonth() === currentMonth
        );
      })
      .map((data) => ({
        ...data,
        timestamp: new Date(data.updated_at).getTime(),
      }));
  }, [vaccineId, sensorDataWithVaccine]);

  const temperatureSeries = useMemo(() => {
    return [
      {
        data: data.map((v) => ({
          x: v.timestamp,
          y: v.temperature,
          id: v.sensor_data_id,
        })),
      },
    ];
  }, [data]);

  const humiditySeries = useMemo(() => {
    return [
      {
        data: data.map((v) => ({
          x: v.timestamp,
          y: v.humidity,
          id: v.sensor_data_id,
        })),
      },
    ];
  }, [data]);

  useEffect(() => {
    if (sensorDataQuery.isError) {
      setError((sensorDataQuery.error as Error)?.message || "Unknown error");
    }
    if (locationItemQuery.isError) {
      setError((locationItemQuery.error as Error)?.message || "Unknown error");
    }
    if (vaccineQuery.isError) {
      setError((vaccineQuery.error as Error)?.message || "Unknown error");
    }
  }, [
    sensorDataQuery.isError,
    locationItemQuery.isError,
    vaccineQuery.isError,
    sensorDataQuery.error,
    locationItemQuery.error,
    vaccineQuery.error,
  ]);

  if (
    sensorDataQuery.isLoading ||
    locationItemQuery.isLoading ||
    vaccineQuery.isLoading
  ) {
    return <Loader />;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Дані сенсора для вакцини за поточний місяць
        </h4>

        <div>
          <FormControl
            size="small"
            fullWidth
            sx={{ m: 1, minWidth: 360, maxWidth: 360 }}
          >
            <Autocomplete
              disablePortal
              onChange={(_, value) => {
                setVaccineId(value || null);
              }}
              value={vaccineId}
              options={vaccineQuery.data?.map((v) => v.vaccine_id) || []}
              getOptionLabel={(option) => {
                return (
                  vaccines.find((v) => v.vaccine_id === option)?.name || ""
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Вакцина"
                  error={!!vaccineQuery.error}
                />
              )}
              size="small"
            />
            <FormHelperText>
              {(vaccineQuery.error as Error)?.message ?? ""}
            </FormHelperText>
          </FormControl>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
        }}
      >
        {
          <div style={{ color: "red" }}>
            {error && <>{`Щось пішло не так: ${error}`}</>}
          </div>
        }
      </div>

      {vaccineId ? (
        <>
          {data.length ? (
            <>
              <h4
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  marginTop: 30,
                  marginBottom: 15,
                }}
              >
                Температура
              </h4>

              <div
                style={{
                  borderRadius: "5px",
                  backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <ScatterChart
                  {...(getChartSettings({
                    yAxisLabel: "Температура (°C)",
                    yAxisMin: -200,
                    yAxisMax: 200,
                    xAxisLabel: ChartSettings.datePreset.label,
                    xAxisMin: ChartSettings.datePreset.min,
                    xAxisMax: ChartSettings.datePreset.max,
                    xAxisValueFormatter:
                      ChartSettings.datePreset.valueFormatter,
                  }) as any)}
                  series={temperatureSeries}
                />
              </div>

              <h4
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",

                  marginTop: 30,
                  marginBottom: 15,
                }}
              >
                Вологість
              </h4>

              <div
                style={{
                  borderRadius: "5px",
                  backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <ScatterChart
                  {...(getChartSettings({
                    yAxisLabel: "Вологість (%)",
                    yAxisMin: 0,
                    yAxisMax: 100,
                    xAxisLabel: ChartSettings.datePreset.label,
                    xAxisMin: ChartSettings.datePreset.min,
                    xAxisMax: ChartSettings.datePreset.max,
                    xAxisValueFormatter:
                      ChartSettings.datePreset.valueFormatter,
                  }) as any)}
                  series={humiditySeries}
                />
              </div>
            </>
          ) : (
            <h4
              style={{
                textTransform: "uppercase",
                fontWeight: "normal",
                marginBlock: 30,
              }}
            >
              Дані сенсора не знайдено
            </h4>
          )}
        </>
      ) : (
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "normal",
            marginBlock: 30,
          }}
        >
          Виберіть вакцину, щоб переглянути дані сенсора
        </h4>
      )}
    </>
  );
};

export default VaccineSensorDataGraph;

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
import { useLocationQuery } from "../features/useLocationQuery";
import { useSensorDataQuery } from "../features/useSensorDataQuery";
import { ChartSettings, getChartSettings } from "../utils/getChartSettings";

export const LocationSensorDataGraph = () => {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const locationQuery = useLocationQuery();
  const sensorDataQuery = useSensorDataQuery();

  const sensorData = useMemo(
    () => sensorDataQuery.data || [],
    [sensorDataQuery.data],
  );

  const data = useMemo(() => {
    if (!locationId) {
      return [];
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return sensorData
      .filter((data) => {
        const dataDate = new Date(data.updated_at);

        return (
          data.location_id === locationId &&
          dataDate.getFullYear() === currentYear &&
          dataDate.getMonth() === currentMonth
        );
      })
      .map((data) => ({
        ...data,
        timestamp: new Date(data.updated_at).getTime(),
      }));
  }, [locationId, sensorData]);

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
    if (locationQuery.isError) {
      setError((locationQuery.error as Error)?.message || "Unknown error");
    }
    if (sensorDataQuery.isError) {
      setError((sensorDataQuery.error as Error)?.message || "Unknown error");
    }
  }, [
    locationQuery.isError,
    sensorDataQuery.isError,
    locationQuery.error,
    sensorDataQuery.error,
  ]);

  if (locationQuery.isLoading || sensorDataQuery.isLoading) {
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
          Дані сенсора для локації за поточний місяць
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
                setLocationId(value || null);
              }}
              value={locationId}
              options={locationQuery.data?.map((l) => l.location_id) || []}
              getOptionLabel={(option) => {
                return (
                  locationQuery.data?.find((l) => l.location_id === option)
                    ?.name || ""
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Локація"
                  error={!!locationQuery.error}
                />
              )}
              size="small"
            />
            <FormHelperText>
              {(locationQuery.error as Error)?.message ?? ""}
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

      {locationId ? (
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
          Виберіть локацію, щоб переглянути дані сенсора
        </h4>
      )}
    </>
  );
};

export default LocationSensorDataGraph;

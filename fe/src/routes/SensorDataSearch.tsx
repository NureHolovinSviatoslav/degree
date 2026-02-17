import { GridColDef } from "@mui/x-data-grid";
import { FormControl, TextField, Autocomplete, Button } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useLocationQuery } from "../features/useLocationQuery";
import { useSensorDataQuery } from "../features/useSensorDataQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";

const StyledDataGrid = getStyledDataGrid();

export const SensorDataSearch = () => {
  const locationQuery = useLocationQuery();
  const locations = useMemo(
    () => locationQuery.data ?? [],
    [locationQuery.data],
  );

  const query = useSensorDataQuery();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const id = param("sensor_data_id");
    const locationId = param("location_id");
    const date = param("updated_at");
    const temperature = param("temperature");
    const humidity = param("humidity");

    return rows.filter((row) => {
      const idOk = !id || row.sensor_data_id.toString() === id;
      const locOk = !locationId || row.location_id.toString() === locationId;
      const dateOk =
        !date || new Date(row.updated_at).toISOString().slice(0, 10) === date;
      const tempOk = !temperature || row.temperature.toString() === temperature;
      const humOk = !humidity || row.humidity.toString() === humidity;
      return idOk && locOk && dateOk && tempOk && humOk;
    });
  }, [rows, param]);

  const columns = useMemo(() => {
    return [
      {
        field: "sensor_data_id",
        headerName: "ID",
        type: "number",
        width: 100,
        renderCell: (cellValues) => (
          <Link
            to={`/sensor-data/${cellValues.row.sensor_data_id}`}
            className="link"
          >
            {cellValues.value}
          </Link>
        ),
      },
      {
        field: "location_id",
        headerName: "Локація",
        type: "number",
        width: 300,
        renderCell: (params) => {
          const location = locations.find(
            (l) => l.location_id === params.value,
          );
          return location ? (
            <Link className="link" to={`/locations/${location.location_id}`}>
              {location.name}
            </Link>
          ) : (
            "-"
          );
        },
      },
      {
        field: "updated_at",
        headerName: "Час надсилання",
        type: "dateTime",
        width: 200,
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
      {
        field: "temperature",
        headerName: "Температура °C",
        type: "number",
        width: 150,
      },
      {
        field: "humidity",
        headerName: "Вологість %",
        type: "number",
        width: 150,
      },
    ] as GridColDef[];
  }, [locations]);

  useEffect(() => {
    if (query.isError) setError((query.error as Error)?.message);
    if (locationQuery.isError)
      setError((locationQuery.error as Error)?.message);
  }, [query.isError, query.error, locationQuery.isError, locationQuery.error]);

  const locationOptions = useMemo(
    () => locations.map((l) => l.location_id.toString()),
    [locations],
  );

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: ".25rem",
          }}
        >
          <div style={{ color: "red" }}>
            {error && `Щось пішло не так: ${error}`}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <TextField
            label="ID"
            size="small"
            type="number"
            value={param("sensor_data_id")}
            onChange={(e) => updateParam("sensor_data_id", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Autocomplete
            disablePortal
            options={locationOptions}
            value={param("location_id")}
            onChange={(_, v) => updateParam("location_id", v ?? "")}
            getOptionLabel={(option) =>
              locations.find((l) => l.location_id.toString() === option)
                ?.name ?? ""
            }
            renderInput={(params) => (
              <TextField {...params} label="Локація" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <TextField
            label="Дата"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={param("updated_at")}
            onChange={(e) => updateParam("updated_at", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Температура"
            size="small"
            type="number"
            value={param("temperature")}
            onChange={(e) => updateParam("temperature", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Вологість"
            size="small"
            type="number"
            value={param("humidity")}
            onChange={(e) => updateParam("humidity", e.target.value)}
          />
        </FormControl>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setSearchParams({})}
        >
          Очистити фільтри
        </Button>
      </div>

      <div
        style={{
          height: 550,
          borderRadius: "5px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <StyledDataGrid
          loading={query.isLoading || locationQuery.isLoading}
          rows={filteredRows}
          getRowId={(row) => row.sensor_data_id}
          columns={columns}
          columnBuffer={3}
          pageSizeOptions={[]}
          getRowHeight={() => "auto"}
          columnHeaderHeight={75}
          rowSelection={false}
          localeText={{ noRowsLabel: "Даних немає" }}
        />
      </div>
    </>
  );
};

export default SensorDataSearch;

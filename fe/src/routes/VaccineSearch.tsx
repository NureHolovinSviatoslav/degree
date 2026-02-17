import { Delete, Edit } from "@mui/icons-material";
import { Button, FormControl, IconButton, TextField } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useVaccineMutation } from "../features/useVaccineMutation";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";

const StyledDataGrid = getStyledDataGrid();

export const VaccineSearch = () => {
  const query = useVaccineQuery();
  const mutation = useVaccineMutation();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const name = param("name").toLowerCase();
    const description = param("description").toLowerCase();
    const minT = param("min_temperature");
    const maxT = param("max_temperature");
    const minH = param("min_humidity");
    const maxH = param("max_humidity");
    return rows.filter((row) => {
      const nameOk = !name || row.name.toLowerCase().includes(name);
      const descOk =
        !description ||
        (row.description ?? "").toLowerCase().includes(description);
      const minTOk = !minT || row.min_temperature.toString() === minT;
      const maxTOk = !maxT || row.max_temperature.toString() === maxT;
      const minHOk = !minH || row.min_humidity.toString() === minH;
      const maxHOk = !maxH || row.max_humidity.toString() === maxH;
      return nameOk && descOk && minTOk && maxTOk && minHOk && maxHOk;
    });
  }, [rows, param]);

  const columns = useMemo(() => {
    return [
      {
        field: "name",
        headerName: "Назва",
        type: "string",
        width: 200,
        renderCell: (cellValues) => {
          return (
            <Link
              to={`/vaccines/${cellValues.row.vaccine_id}`}
              className="link"
            >
              {cellValues.value}
            </Link>
          );
        },
      },
      {
        field: "description",
        headerName: "Опис",
        type: "string",
        width: 300,
      },
      {
        field: "min_temperature",
        headerName: "Мін. температура",
        type: "number",
        width: 150,
      },
      {
        field: "max_temperature",
        headerName: "Макс. температура",
        type: "number",
        width: 150,
      },
      {
        field: "min_humidity",
        headerName: "Мін. вологість",
        type: "number",
        width: 150,
      },
      {
        field: "max_humidity",
        headerName: "Макс. вологість",
        type: "number",
        width: 150,
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 85,
        renderCell: (cellValues) => {
          return (
            <>
              <Link to={`/vaccines/update/${cellValues.row.vaccine_id}`}>
                <IconButton aria-label="edit">
                  <Edit />
                </IconButton>
              </Link>
              <IconButton
                aria-label="delete"
                onClick={() => {
                  setError("");
                  const id = cellValues.row.vaccine_id;
                  const confirm = window.confirm(
                    `Видалити вакцину ${cellValues.row.name}?`,
                  );
                  if (!confirm) {
                    return;
                  }
                  mutation
                    .mutateAsync({
                      type: "delete",
                      data: { vaccine_id: id },
                    })
                    .catch((error) => {
                      setError(error.message);
                    });
                }}
              >
                <Delete />
              </IconButton>
            </>
          ) as React.JSX.Element;
        },
      },
    ] as GridColDef[];
  }, [mutation]);

  useEffect(() => {
    if (query.isError) {
      setError((query.error as Error)?.message);
    }
  }, [query.isError, query.error]);

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
            {error && <>{`Щось пішло не так: ${error}`}</>}
          </div>
          <Link to="/vaccines/create">
            <Button variant="contained" color="success">
              Додати вакцину
            </Button>
          </Link>
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
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <TextField
            label="Назва"
            size="small"
            value={param("name")}
            onChange={(e) => updateParam("name", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <TextField
            label="Опис"
            size="small"
            value={param("description")}
            onChange={(e) => updateParam("description", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Мін. t°"
            size="small"
            type="number"
            value={param("min_temperature")}
            onChange={(e) => updateParam("min_temperature", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Макс. t°"
            size="small"
            type="number"
            value={param("max_temperature")}
            onChange={(e) => updateParam("max_temperature", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Мін. вологість"
            size="small"
            type="number"
            value={param("min_humidity")}
            onChange={(e) => updateParam("min_humidity", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Макс. вологість"
            size="small"
            type="number"
            value={param("max_humidity")}
            onChange={(e) => updateParam("max_humidity", e.target.value)}
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
          loading={query.isLoading}
          rows={filteredRows}
          getRowId={(row) => row.vaccine_id}
          columns={columns}
          columnBuffer={3}
          pageSizeOptions={[]}
          getRowHeight={() => "auto"}
          columnHeaderHeight={75}
          rowSelection={false}
          localeText={{
            noRowsLabel: "Даних немає",
          }}
        />
      </div>
    </>
  );
};

export default VaccineSearch;

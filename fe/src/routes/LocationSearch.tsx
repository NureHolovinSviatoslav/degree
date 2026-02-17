import { Delete, Edit, Summarize } from "@mui/icons-material";
import {
  Button,
  IconButton,
  FormControl,
  TextField,
  Autocomplete,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useLocationMutation } from "../features/useLocationMutation";
import { useLocationQuery } from "../features/useLocationQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";

const StyledDataGrid = getStyledDataGrid();

export const LocationSearch = () => {
  const query = useLocationQuery();
  const mutation = useLocationMutation();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const name = param("name").toLowerCase();
    const address = param("address").toLowerCase();
    const responsible = param("responsible_username");
    const maxQuantity = param("max_quantity");
    return rows.filter((row) => {
      const nameOk = !name || row.name.toLowerCase().includes(name);
      const addressOk = !address || row.address.toLowerCase().includes(address);
      const respOk = !responsible || row.responsible_username === responsible;
      const maxQOk =
        !maxQuantity || row.max_quantity.toString() === maxQuantity;
      return nameOk && addressOk && respOk && maxQOk;
    });
  }, [rows, param]);

  const columns = useMemo(() => {
    return [
      {
        field: "name",
        headerName: "Назва локації",
        type: "string",
        width: 200,
        renderCell: (cellValues) => (
          <Link
            to={`/locations/${cellValues.row.location_id}`}
            className="link"
          >
            {cellValues.value}
          </Link>
        ),
      },
      {
        field: "address",
        headerName: "Адреса",
        type: "string",
        width: 250,
      },
      {
        field: "responsible_username",
        headerName: "Відповідальний",
        type: "string",
        width: 200,
        renderCell: (cellValues) => (
          <Link
            to={`/users/${cellValues.row.responsible_username}`}
            className="link"
          >
            {cellValues.value}
          </Link>
        ),
      },
      {
        field: "max_quantity",
        headerName: "Максимальна вмістимість",
        type: "number",
        width: 180,
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 85,
        renderCell: (cellValues) => (
          <>
            <Link to={`/locations/report/${cellValues.row.location_id}`}>
              <IconButton aria-label="report">
                <Summarize />
              </IconButton>
            </Link>
            <Link to={`/locations/update/${cellValues.row.location_id}`}>
              <IconButton aria-label="edit">
                <Edit />
              </IconButton>
            </Link>
            <IconButton
              aria-label="delete"
              onClick={() => {
                setError("");
                const id = cellValues.row.location_id;
                const confirm = window.confirm(
                  `Видалити локацію ${cellValues.row.name}?`,
                );
                if (!confirm) return;
                mutation
                  .mutateAsync({
                    type: "delete",
                    data: { location_id: id },
                  })
                  .catch((e) => setError(e.message));
              }}
            >
              <Delete />
            </IconButton>
          </>
        ),
      },
    ] as GridColDef[];
  }, [mutation]);

  useEffect(() => {
    if (query.isError) setError((query.error as Error)?.message);
  }, [query.isError, query.error]);

  const responsibleOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.responsible_username))).sort(),
    [rows],
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
          <Link to="/locations/create">
            <Button variant="contained" color="success">
              Додати локацію
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

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <TextField
            label="Адреса"
            size="small"
            value={param("address")}
            onChange={(e) => updateParam("address", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Autocomplete
            disablePortal
            options={responsibleOptions}
            value={param("responsible_username")}
            onChange={(_, v) => updateParam("responsible_username", v ?? "")}
            renderInput={(params) => (
              <TextField {...params} label="Відповідальний" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Макс. вмістимість"
            size="small"
            type="number"
            value={param("max_quantity")}
            onChange={(e) => updateParam("max_quantity", e.target.value)}
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
          getRowId={(row) => row.location_id}
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

export default LocationSearch;

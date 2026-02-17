import { Delete, Edit } from "@mui/icons-material";
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

import { useLocationItemMutation } from "../features/useLocationItemMutation";
import { useLocationItemQuery } from "../features/useLocationItemQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";
import { useLocationQuery } from "../features/useLocationQuery";
import { useVaccineQuery } from "../features/useVaccineQuery";

const StyledDataGrid = getStyledDataGrid();

export const LocationItemSearch = () => {
  const locationQuery = useLocationQuery();
  const locations = useMemo(
    () => locationQuery.data ?? [],
    [locationQuery.data],
  );

  const vaccineQuery = useVaccineQuery();
  const vaccines = useMemo(() => vaccineQuery.data ?? [], [vaccineQuery.data]);

  const query = useLocationItemQuery();
  const mutation = useLocationItemMutation();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const id = param("location_item_id");
    const locationId = param("location_id");
    const vaccineId = param("vaccine_id");
    const quantity = param("quantity");
    return rows.filter((row) => {
      const idOk = !id || row.location_item_id.toString() === id;
      const locOk = !locationId || row.location_id.toString() === locationId;
      const vacOk = !vaccineId || row.vaccine_id.toString() === vaccineId;
      const qtyOk = !quantity || row.quantity.toString() === quantity;
      return idOk && locOk && vacOk && qtyOk;
    });
  }, [rows, param]);

  const columns = useMemo(() => {
    return [
      {
        field: "location_item_id",
        headerName: "ID",
        type: "number",
        width: 100,
        renderCell: (cellValues) => (
          <Link
            to={`/location-items/${cellValues.row.location_item_id}`}
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
        field: "vaccine_id",
        headerName: "Вакцина",
        type: "number",
        width: 150,
        renderCell: (params) => {
          const vaccine = vaccines.find((v) => v.vaccine_id === params.value);
          return vaccine ? (
            <Link className="link" to={`/vaccines/${vaccine.vaccine_id}`}>
              {vaccine.name}
            </Link>
          ) : (
            "-"
          );
        },
      },
      {
        field: "quantity",
        headerName: "Місткість",
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
        renderCell: (cellValues) => (
          <>
            <Link
              to={`/location-items/update/${cellValues.row.location_item_id}`}
            >
              <IconButton aria-label="edit">
                <Edit />
              </IconButton>
            </Link>
            <IconButton
              aria-label="delete"
              onClick={() => {
                setError("");
                const id = cellValues.row.location_item_id;
                const confirm = window.confirm(
                  `Видалити елемент локації ${id}?`,
                );
                if (!confirm) return;
                mutation
                  .mutateAsync({
                    type: "delete",
                    data: { location_item_id: id },
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
  }, [mutation, locations, vaccines]);

  useEffect(() => {
    if (query.isError) setError((query.error as Error)?.message);
    if (locationQuery.isError)
      setError((locationQuery.error as Error)?.message);
    if (vaccineQuery.isError) setError((vaccineQuery.error as Error)?.message);
  }, [
    query.isError,
    query.error,
    locationQuery.isError,
    locationQuery.error,
    vaccineQuery.isError,
    vaccineQuery.error,
  ]);

  const locationOptions = useMemo(
    () => locations.map((l) => l.location_id.toString()),
    [locations],
  );
  const vaccineOptions = useMemo(
    () => vaccines.map((v) => v.vaccine_id.toString()),
    [vaccines],
  );

  const getLocationLabel = (id: string) =>
    locations.find((l) => l.location_id.toString() === id)?.name ?? id;
  const getVaccineLabel = (id: string) =>
    vaccines.find((v) => v.vaccine_id.toString() === id)?.name ?? id;

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
          <Link to="/location-items/create">
            <Button variant="contained" color="success">
              Додати елемент локації
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
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <TextField
            label="ID"
            size="small"
            type="number"
            value={param("location_item_id")}
            onChange={(e) => updateParam("location_item_id", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Autocomplete
            disablePortal
            options={locationOptions}
            value={param("location_id")}
            onChange={(_, v) => updateParam("location_id", v ?? "")}
            getOptionLabel={getLocationLabel}
            renderInput={(p) => (
              <TextField {...p} label="Локація" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Autocomplete
            disablePortal
            options={vaccineOptions}
            value={param("vaccine_id")}
            onChange={(_, v) => updateParam("vaccine_id", v ?? "")}
            getOptionLabel={getVaccineLabel}
            renderInput={(p) => (
              <TextField {...p} label="Вакцина" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <TextField
            label="Місткість"
            size="small"
            type="number"
            value={param("quantity")}
            onChange={(e) => updateParam("quantity", e.target.value)}
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
          loading={
            query.isLoading || locationQuery.isLoading || vaccineQuery.isLoading
          }
          rows={filteredRows}
          getRowId={(row) => row.location_item_id}
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

export default LocationItemSearch;

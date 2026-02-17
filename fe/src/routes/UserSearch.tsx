import { Delete, Edit } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useUserMutation } from "../features/useUserMutation";
import { useUserQuery } from "../features/useUserQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";

const StyledDataGrid = getStyledDataGrid();

export const UserSearch = () => {
  const query = useUserQuery();
  const mutation = useUserMutation();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => {
      const value = searchParams.get(key);
      if (value === null) {
        return "";
      }
      return value;
    },
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const username = param("username").toLowerCase();
    const role = param("role");
    const phone = param("phone").toLowerCase();
    return rows.filter((row) => {
      const usernameOk =
        !username || row.username.toLowerCase().includes(username);
      const roleOk = !role || row.role === role;
      const phoneOk = !phone || (row.phone ?? "").toLowerCase().includes(phone);
      return usernameOk && roleOk && phoneOk;
    });
  }, [param, rows]);

  const columns = useMemo(() => {
    return [
      {
        field: "username",
        headerName: "Логін",
        type: "string",
        width: 200,
        renderCell: (cellValues) => {
          return (
            <Link to={`/users/${cellValues.row.username}`} className="link">
              {cellValues.value}
            </Link>
          );
        },
      },
      {
        field: "role",
        headerName: "Роль",
        type: "string",
        width: 200,
      },
      {
        field: "phone",
        headerName: "Телефон",
        type: "string",
        renderCell: (cellValues) => {
          return cellValues.value ? (
            <a className="link" href={`tel:${cellValues.value}`}>
              {cellValues.value}
            </a>
          ) : (
            "-"
          );
        },
        width: 300,
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
              <Link to={`/users/update/${cellValues.row.username}`}>
                <IconButton aria-label="edit">
                  <Edit />
                </IconButton>
              </Link>
              <IconButton
                aria-label="delete"
                onClick={() => {
                  setError("");

                  const id = cellValues.row.username;

                  const confirm = window.confirm(`Видалити користувача ${id}?`);

                  if (!confirm) {
                    return;
                  }

                  mutation
                    .mutateAsync({
                      type: "delete",
                      data: { username: id },
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

  const roleOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.role))).sort(),
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
      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: ".25rem",
          }}
        >
          {
            <div style={{ color: "red" }}>
              {error && <>{`Щось пішло не так: ${error}`}</>}
            </div>
          }

          <Link to="/users/create">
            <Button variant="contained" color="success">
              Зареєструвати користувача
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <TextField
            label="Логін"
            size="small"
            value={param("username")}
            onChange={(e) => updateParam("username", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Autocomplete
            disablePortal
            options={roleOptions}
            value={param("role")}
            onChange={(_, v) => updateParam("role", v ?? "")}
            renderInput={(params) => (
              <TextField {...params} label="Роль" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <TextField
            label="Телефон"
            size="small"
            value={param("phone")}
            onChange={(e) => updateParam("phone", e.target.value)}
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
          getRowId={(row) => row.username}
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

export default UserSearch;

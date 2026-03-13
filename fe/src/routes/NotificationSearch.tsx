import { GridColDef } from "@mui/x-data-grid";
import { FormControl, TextField, Autocomplete, Button } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useNotificationQuery } from "../features/useNotificationQuery";
import { getStyledDataGrid } from "../utils/getStyledDataGrid";

const StyledDataGrid = getStyledDataGrid();

export const NotificationSearch = () => {
  const query = useNotificationQuery();
  const [error, setError] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const id = param("notification_id");
    const username = param("notified_username");
    const phone = param("phone").toLowerCase();
    const date = param("sent_at");
    const message = param("message").toLowerCase();
    const type = param("notification_type");

    return rows.filter((r) => {
      const idOk = !id || r.notification_id.toString() === id;
      const userOk = !username || r.notified_username === username;
      const phoneOk = !phone || (r.phone ?? "").toLowerCase().includes(phone);
      const dateOk =
        !date || new Date(r.sent_at).toISOString().slice(0, 10) === date;
      const msgOk = !message || r.message.toLowerCase().includes(message);
      const typeOk = !type || r.notification_type === type;
      return idOk && userOk && phoneOk && dateOk && msgOk && typeOk;
    });
  }, [rows, param]);

  const columns = useMemo(() => {
    return [
      {
        field: "notification_id",
        headerName: "ID",
        type: "number",
        width: 100,
        renderCell: (v) => (
          <Link to={`/notifications/${v.row.notification_id}`} className="link">
            {v.value}
          </Link>
        ),
      },
      {
        field: "notified_username",
        headerName: "Оператор",
        type: "string",
        width: 200,
        renderCell: (v) =>
          v.value ? (
            <Link to={`/users/${v.value}`} className="link">
              {v.value}
            </Link>
          ) : (
            "-"
          ),
      },
      {
        field: "phone",
        headerName: "Телефон",
        type: "string",
        width: 150,
        renderCell: (v) =>
          v.value ? (
            <a className="link" href={`tel:${v.value}`}>
              {v.value}
            </a>
          ) : (
            "-"
          ),
      },
      {
        field: "sent_at",
        headerName: "Відправлено",
        type: "dateTime",
        width: 200,
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
      },
      {
        field: "message",
        headerName: "Повідомлення",
        type: "string",
        width: 300,
      },
      {
        field: "notification_type",
        headerName: "Тип",
        type: "string",
        width: 150,
      },
    ] as GridColDef[];
  }, []);

  useEffect(() => {
    if (query.isError) setError((query.error as Error)?.message);
  }, [query.isError, query.error]);

  const usernameOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.notified_username).filter(Boolean))),
    [rows],
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.notification_type))),
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
            value={param("notification_id")}
            onChange={(e) => updateParam("notification_id", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Autocomplete
            disablePortal
            options={usernameOptions}
            value={param("notified_username")}
            onChange={(_, v) => updateParam("notified_username", v ?? "")}
            renderInput={(p) => (
              <TextField {...p} label="Оператор" size="small" />
            )}
            clearOnEscape
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <TextField
            label="Телефон"
            size="small"
            value={param("phone")}
            onChange={(e) => updateParam("phone", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <TextField
            label="Дата"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={param("sent_at")}
            onChange={(e) => updateParam("sent_at", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <TextField
            label="Повідомлення"
            size="small"
            value={param("message")}
            onChange={(e) => updateParam("message", e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Autocomplete
            disablePortal
            options={typeOptions}
            value={param("notification_type")}
            onChange={(_, v) => updateParam("notification_type", v ?? "")}
            renderInput={(p) => <TextField {...p} label="Тип" size="small" />}
            clearOnEscape
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
          getRowId={(r) => r.notification_id}
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

export default NotificationSearch;

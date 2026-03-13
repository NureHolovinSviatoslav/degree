import { yupResolver } from "@hookform/resolvers/yup";
import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Loader from "../components/Loader";
import { useLocationMutation } from "../features/useLocationMutation";
import { useLocationQuery } from "../features/useLocationQuery";
import { Location } from "../types/Location";
import { useEdit } from "../utils/useEdit";
import { useUserQuery } from "../features/useUserQuery";

const schema = yup.object({
  name: yup.string().required("Заповніть поле"),
  address: yup.string().required("Заповніть поле"),
  responsible_username: yup.string().nullable().required("Заповніть поле"),
  max_quantity: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле")
    .min(1, "Мінімальне значення 1"),
}) as yup.ObjectSchema<Location>;

const LocationMutate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const {
    id: locationId,
    isEdit,
    isLoading,
    values,
  } = useEdit(useLocationQuery, setError);
  const mutation = useLocationMutation();

  const userQuery = useUserQuery();

  const form = useForm<Location>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      address: "",
      responsible_username: null,
      max_quantity: 0,
    },
    values,
    resetOptions: { keepDefaultValues: true },
  });

  const handleCreate = form.handleSubmit((data) => {
    setError("");
    mutation
      .mutateAsync({
        type: isEdit ? "update" : "create",
        data,
      })
      .then((data) => {
        navigate(`/locations/${data.location_id}`);
      })
      .catch((err) => {
        setError(err.message);
      });
  });

  const handleReset = () => {
    setError("");
    form.reset();
  };

  if (isLoading || userQuery.isLoading) {
    return <Loader />;
  }

  if (isEdit && !values) {
    return (
      <div style={{ paddingInline: 10 }}>
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Локацію не знайдено
        </h4>
      </div>
    );
  }

  return (
    <div style={{ paddingInline: 10 }}>
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
          {isEdit ? "Редагувати" : "Додати"} локацію
          {isEdit && ` # ${locationId}`}
        </h4>
      </div>

      <div style={{ color: "red", paddingBottom: 10 }}>
        {error && <>Щось пішло не так: {error}</>}
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 5,
        }}
      >
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
          onSubmit={handleCreate}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Назва локації"
                  placeholder="Введіть назву локації"
                  onChange={field.onChange}
                  value={field.value}
                  type="search"
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </FormControl>
            )}
          />

          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Адреса"
                  placeholder="Введіть адресу локації"
                  onChange={field.onChange}
                  value={field.value}
                  type="search"
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </FormControl>
            )}
          />

          <Controller
            name="responsible_username"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <Autocomplete
                  disablePortal
                  onChange={(_, value) => {
                    field.onChange(value || null);
                  }}
                  value={field.value}
                  options={userQuery.data?.map((user) => user.username) || []}
                  getOptionLabel={(option) => {
                    return option ? `${option}` : "";
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Відповідальний"
                      error={!!fieldState.error || !!userQuery.isError}
                    />
                  )}
                  size="small"
                />

                <FormHelperText
                  component="span"
                  error={!!fieldState.error || !!userQuery.isError}
                >
                  {(fieldState.error?.message ||
                    (userQuery.error as Error)?.message) && (
                    <div>
                      {fieldState.error?.message ||
                        (userQuery.error as Error)?.message}
                    </div>
                  )}
                </FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="max_quantity"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Максимальна міскість"
                  placeholder="Введіть максимальну міскість"
                  onChange={field.onChange}
                  value={field.value}
                  type="number"
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </FormControl>
            )}
          />

          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{ m: 1, minWidth: 80 }}
            >
              {isEdit ? "Редагувати" : "Додати"}
            </Button>
            <Button
              onClick={handleReset}
              variant="contained"
              color="error"
              sx={{ m: 1, minWidth: 80 }}
            >
              Очистити
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationMutate;

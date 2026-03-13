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
import { useLocationItemMutation } from "../features/useLocationItemMutation";
import { useLocationItemQuery } from "../features/useLocationItemQuery";
import { useLocationQuery } from "../features/useLocationQuery";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { LocationItem } from "../types/LocationItem";
import { useEdit } from "../utils/useEdit";

const schema = yup.object({
  location_id: yup.string().required("Виберіть локацію"),
  vaccine_id: yup.string().required("Виберіть вакцину"),
  quantity: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле")
    .min(1, "Мінімальне значення 1"),
}) as yup.ObjectSchema<LocationItem>;

const LocationItemMutate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const {
    id: locationItemId,
    isEdit,
    isLoading,
    values,
  } = useEdit(useLocationItemQuery, setError);
  const mutation = useLocationItemMutation();

  const locationOptionsQuery = useLocationQuery();
  const vaccineOptionsQuery = useVaccineQuery();

  const form = useForm<LocationItem>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      location_id: "",
      vaccine_id: "",
      quantity: 0,
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
        navigate(`/location-items/${data.location_item_id}`);
      })
      .catch((err) => {
        setError(err.message);
      });
  });

  const handleReset = () => {
    setError("");
    form.reset();
  };

  if (
    isLoading ||
    locationOptionsQuery.isLoading ||
    vaccineOptionsQuery.isLoading
  ) {
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
          Елемент локації не знайдено
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
          {isEdit ? "Редагувати" : "Додати"} елемент локації
          {isEdit && ` # ${locationItemId}`}
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
            name="location_id"
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
                  options={
                    locationOptionsQuery.data?.map((l) => l.location_id) || []
                  }
                  getOptionLabel={(option) => {
                    return (
                      locationOptionsQuery.data?.find(
                        (l) => l.location_id === option,
                      )?.name || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Локація"
                      error={!!fieldState.error || !!locationOptionsQuery.error}
                    />
                  )}
                  size="small"
                />
                <FormHelperText>
                  {fieldState.error?.message ||
                    ((locationOptionsQuery.error as Error)?.message ?? "")}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="vaccine_id"
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
                  options={
                    vaccineOptionsQuery.data?.map((v) => v.vaccine_id) || []
                  }
                  getOptionLabel={(option) => {
                    return (
                      vaccineOptionsQuery.data?.find(
                        (v) => v.vaccine_id === option,
                      )?.name || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Вакцина"
                      error={!!fieldState.error || !!vaccineOptionsQuery.error}
                    />
                  )}
                  size="small"
                />
                <FormHelperText error>
                  {fieldState.error?.message ||
                    ((vaccineOptionsQuery.error as Error)?.message ?? "")}
                </FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="quantity"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Кількість"
                  placeholder="Введіть кількість"
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

export default LocationItemMutate;

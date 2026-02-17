import { yupResolver } from "@hookform/resolvers/yup";
import { Button, FormControl, TextField } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Loader from "../components/Loader";
import { useVaccineMutation } from "../features/useVaccineMutation";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { Vaccine } from "../types/Vaccine";
import { useEdit } from "../utils/useEdit";

const schema = yup.object({
  name: yup.string().required("Заповніть поле"),
  description: yup.string().required("Заповніть поле"),
  min_temperature: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле"),
  max_temperature: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле"),
  min_humidity: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле"),
  max_humidity: yup
    .number()
    .typeError("Має бути число")
    .required("Заповніть поле"),
}) as yup.ObjectSchema<Vaccine>;

const VaccineMutate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const {
    id: vaccineId,
    isEdit,
    isLoading,
    values,
  } = useEdit(useVaccineQuery, setError);
  const mutation = useVaccineMutation();

  const form = useForm<Vaccine>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      description: "",
      min_temperature: 0,
      max_temperature: 0,
      min_humidity: 0,
      max_humidity: 0,
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
        navigate(`/vaccines/${data.vaccine_id}`);
      })
      .catch((err) => {
        setError(err.message);
      });
  });

  const handleReset = () => {
    setError("");
    form.reset();
  };

  if (isLoading) {
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
          Вакцину не знайдено
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
          {isEdit ? "Редагувати" : "Додати"} вакцину
          {isEdit && ` # ${vaccineId}`}
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
                  label="Назва вакцини"
                  placeholder="Введіть назву вакцини"
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
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Опис"
                  placeholder="Введіть опис вакцини"
                  onChange={field.onChange}
                  value={field.value}
                  multiline
                  minRows={3}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </FormControl>
            )}
          />

          <Controller
            name="min_temperature"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Мін. температура"
                  placeholder="Введіть мінімальну температуру"
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

          <Controller
            name="max_temperature"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Макс. температура"
                  placeholder="Введіть максимальну температуру"
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

          <Controller
            name="min_humidity"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Мін. вологість"
                  placeholder="Введіть мінімальну вологість"
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

          <Controller
            name="max_humidity"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                size="small"
                fullWidth
                sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
              >
                <TextField
                  label="Макс. вологість"
                  placeholder="Введіть максимальну вологість"
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

export default VaccineMutate;

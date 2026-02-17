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
import { useUserMutation } from "../features/useUserMutation";
import { useUserQuery } from "../features/useUserQuery";
import { User, UserRole } from "../types/User";
import { useEdit } from "../utils/useEdit";
import Loader from "../components/Loader";

const schema = yup.object({
  username: yup.string().required("Заповніть поле"),
  password: yup
    .string()
    .required("Заповніть поле")
    .min(8, "Мінімум 8 символів")
    .matches(/[a-zA-Z]/, "Мінімум одна літера")
    .matches(/[0-9]/, "Мінімум одна цифра"),
  role: yup.string().nullable().required("Заповніть поле"),
  phone: yup
    .string()
    .required("Заповніть поле")
    .matches(/^\+380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
}) as yup.ObjectSchema<User>;

const UserMutate = () => {
  const navigate = useNavigate();

  const [error, setError] = useState<string>("");

  const {
    id: username,
    isEdit,
    isLoading,
    values,
  } = useEdit(useUserQuery, setError);
  const mutation = useUserMutation();

  const form = useForm<User>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      password: "",
      role: null,
      phone: "",
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
        navigate(`/users/${data.username}`);
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
      <div
        style={{
          paddingInline: 10,
        }}
      >
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Користувача не знайдено
        </h4>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          paddingInline: 10,
        }}
      >
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
            {isEdit ? "Редагувати" : "Зареєструвати"} користувача
            {isEdit && ` # ${username}`}
          </h4>
        </div>

        <div
          style={{
            color: "red",
            paddingBottom: 10,
          }}
        >
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
            }}
          >
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
                >
                  <TextField
                    label="Логін"
                    placeholder="user_1"
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
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
                >
                  <TextField
                    label="Пароль"
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
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
                >
                  <TextField
                    label="Телефон"
                    placeholder="+380XXXXXXXXX"
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
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ m: 1, minWidth: 120, maxWidth: "95%" }}
                  error={!!fieldState.error}
                >
                  <Autocomplete
                    disablePortal
                    onChange={(_, value) => {
                      field.onChange(value || null);
                    }}
                    value={field.value}
                    options={[...Object.values(UserRole)]}
                    getOptionLabel={(option) => {
                      return option ? `${option}` : "";
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Роль*"
                        error={!!fieldState.error}
                      />
                    )}
                    size="small"
                  />

                  <FormHelperText component="span" error={!!fieldState.error}>
                    {fieldState.error?.message && (
                      <div>{fieldState.error?.message}</div>
                    )}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </form>

          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={handleCreate}
              variant="contained"
              sx={{ m: 1, minWidth: 80 }}
            >
              {isEdit ? "Редагувати" : "Зареєструвати"}
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
        </div>
      </div>
    </>
  );
};

export default UserMutate;

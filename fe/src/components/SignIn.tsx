import { Button, FormControl, TextField } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLoginMutation } from "../features/useLoginMutation";
import { Login } from "../types/Login";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  username: yup.string().required("Заповніть поле"),
  password: yup.string().required("Заповніть поле"),
});

const SignIn = () => {
  const [error, setError] = useState<string>("");

  const login = useLoginMutation();

  const form = useForm<Login>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      password: "",
    },
    values: undefined,
    resetOptions: { keepDefaultValues: true },
  });

  const handleCreate = form.handleSubmit((data) => {
    setError("");

    login.mutateAsync(data).catch((err) => {
      setError(err.message);
    });
  });
  const handleReset = () => {
    setError("");
    form.reset();
  };

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
            Увійти в систему
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
                    required
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
                    size="small"
                    required
                    type="password"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
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
              Увійти
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

export default SignIn;

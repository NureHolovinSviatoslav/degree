import { yupResolver } from "@hookform/resolvers/yup";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as yup from "yup";

import { useRegisterMutation } from "../features/useRegisterMutation";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const schema = yup.object({
  name: yup.string().required("Заповніть поле"),
  email: yup
    .string()
    .required("Заповніть поле")
    .email("Невірний формат email"),
  password: yup
    .string()
    .required("Заповніть поле")
    .min(8, "Мінімум 8 символів")
    .matches(/[a-zA-Z]/, "Мінімум одна літера")
    .matches(/[0-9]/, "Мінімум одна цифра"),
  confirmPassword: yup
    .string()
    .required("Заповніть поле")
    .oneOf([yup.ref("password")], "Паролі не співпадають"),
  phone: yup
    .string()
    .optional()
    .matches(/^(\+380\d{9})?$/, "Формат: +380XXXXXXXXX"),
});

type SignUpFormData = yup.InferType<typeof schema>;

const SignUp = () => {
  const [error, setError] = useState("");
  const register = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (data) => {
    setError("");

    try {
      await register.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Реєстрація</CardTitle>
          <CardDescription>
            Створіть обліковий запис для доступу до платформи
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Щось пішло не так: {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Ім'я</Label>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Іван Петренко"
                      aria-invalid={fieldState.error ? "true" : undefined}
                      className={fieldState.error ? "bg-destructive/5" : ""}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Електронна пошта</Label>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="reg-email"
                      type="text"
                      placeholder="user@example.com"
                      aria-invalid={fieldState.error ? "true" : undefined}
                      className={fieldState.error ? "bg-destructive/5" : ""}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Пароль</Label>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="reg-password"
                      type="password"
                      aria-invalid={fieldState.error ? "true" : undefined}
                      className={fieldState.error ? "bg-destructive/5" : ""}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-confirm-password">Підтвердіть пароль</Label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="reg-confirm-password"
                      type="password"
                      aria-invalid={fieldState.error ? "true" : undefined}
                      className={fieldState.error ? "bg-destructive/5" : ""}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="phone"
                      type="text"
                      placeholder="+380XXXXXXXXX"
                      aria-invalid={fieldState.error ? "true" : undefined}
                      className={fieldState.error ? "bg-destructive/5" : ""}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Завантаження..." : "Зареєструватись"}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Вже маєте обліковий запис?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Увійти
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;

import { yupResolver } from "@hookform/resolvers/yup";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as yup from "yup";

import { useLoginMutation } from "../features/useLoginMutation";

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
  email: yup.string().required("Заповніть поле"),
  password: yup.string().required("Заповніть поле"),
});

type SignInFormData = yup.InferType<typeof schema>;

const SignIn = () => {
  const [error, setError] = useState("");
  const login = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (data) => {
    setError("");

    try {
      await login.mutateAsync(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Увійти в систему</CardTitle>
          <CardDescription>
            Введіть свої дані для входу на платформу
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
              <Label htmlFor="email">Електронна пошта</Label>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="email"
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
              <Label htmlFor="password">Пароль</Label>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="password"
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

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Завантаження..." : "Увійти"}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Немає облікового запису?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Зареєструватись
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

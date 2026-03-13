import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, RotateCcw } from "lucide-react";

import { useLoginMutation } from "../features/useLoginMutation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const schema = z.object({
  email: z.string().min(1, "Заповніть поле"),
  password: z.string().min(1, "Заповніть поле"),
});

const SignIn = () => {
  const [error, setError] = useState("");
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as never,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setError("");
    login.mutateAsync(data).catch((err: Error) => {
      setError(err.message);
    });
  });

  const onReset = () => {
    setError("");
    reset();
  };

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

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                type="text"
                placeholder="user@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                Увійти
              </Button>
              <Button type="button" variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

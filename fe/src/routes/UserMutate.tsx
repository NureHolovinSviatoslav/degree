import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { User, UserRole } from "../types/User";
import { useUserQuery } from "../features/useUserQuery";
import { useUserMutation } from "../features/useUserMutation";
import { useEdit } from "../utils/useEdit";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Loader from "../components/Loader";

const ROLE_LABELS: Record<string, string> = {
  admin: "Адміністратор",
  teacher: "Викладач",
  student: "Студент",
};

const createSchema = yup.object({
  name: yup.string().required("Заповніть поле"),
  email: yup.string().required("Заповніть поле").email("Невірний формат email"),
  password: yup
    .string()
    .required("Заповніть поле")
    .min(8, "Мінімум 8 символів")
    .matches(/[a-zA-Z]/, "Мінімум одна літера")
    .matches(/[0-9]/, "Мінімум одна цифра"),
  role: yup.string().nullable().required("Заповніть поле"),
  phone: yup
    .string()
    .optional()
    .matches(/^(\+380\d{9})?$/, "Формат: +380XXXXXXXXX"),
});

const editSchema = yup.object({
  name: yup.string().required("Заповніть поле"),
  email: yup.string().required("Заповніть поле").email("Невірний формат email"),
  password: yup
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .test(
      "password-strength",
      "Мінімум 8 символів, одна літера і одна цифра",
      (v) => {
        if (!v) return true;
        return v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
      },
    ),
  role: yup.string().nullable().required("Заповніть поле"),
  phone: yup
    .string()
    .optional()
    .matches(/^(\+380\d{9})?$/, "Формат: +380XXXXXXXXX"),
});

type FormData = yup.InferType<typeof createSchema>;

export const UserMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(useUserQuery, setError);
  const mutation = useUserMutation();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(isEdit ? editSchema : createSchema) as any,
    values: values
      ? ({
          name: values.name,
          email: values.email,
          password: "",
          role: values.role ?? "",
          phone: values.phone ?? "",
        } as FormData)
      : undefined,
  });

  const onSubmit = (data: FormData) => {
    const payload: Partial<User> & { id?: string } = {
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      phone: data.phone || undefined,
    };

    if (data.password) {
      payload.password = data.password;
    }

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as User },
        {
          onSuccess: () => navigate(`/users/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as User },
        {
          onSuccess: (result) => navigate(`/users/${result.id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl p-6">
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/users">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Редагувати користувача" : "Створити користувача"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Ім'я</Label>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} value={field.value ?? ""} />
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <>
                    <Input type="email" {...field} value={field.value ?? ""} />
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Пароль</Label>
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      type="password"
                      {...field}
                      value={field.value ?? ""}
                      placeholder={
                        isEdit ? "Залиште порожнім щоб не змінювати" : ""
                      }
                    />
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Роль</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть роль</option>
                      {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r] ?? r}
                        </option>
                      ))}
                    </select>
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="+380XXXXXXXXX"
                    />
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <Button type="submit" disabled={mutation.isLoading}>
              {isEdit ? "Зберегти" : "Створити"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMutate;

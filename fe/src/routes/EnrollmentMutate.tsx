import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { Enrollment } from "../types/Enrollment";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useEnrollmentMutation } from "../features/useEnrollmentMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useCourseQuery } from "../features/useCourseQuery";
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

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процесі",
  completed: "Завершено",
};

const schema = yup.object({
  user_id: yup.string().required("Заповніть поле"),
  course_id: yup.string().required("Заповніть поле"),
  status: yup
    .string()
    .required("Заповніть поле")
    .oneOf(["in_progress", "completed"]),
  completion_percent: yup
    .number()
    .required("Заповніть поле")
    .min(0)
    .max(100)
    .typeError("Має бути числом"),
  last_activity_at: yup.string().optional().nullable(),
});

type FormData = yup.InferType<typeof schema>;

export const EnrollmentMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(
    useEnrollmentQuery,
    setError,
  );
  const mutation = useEnrollmentMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();
  const { data: courses = [] } = useCourseQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? {
          user_id: values.user_id,
          course_id: values.course_id,
          status: values.status,
          completion_percent: values.completion_percent,
          last_activity_at: values.last_activity_at ?? "",
        }
      : undefined,
    resetOptions: { keepDefaultValues: true },
  });

  const onSubmit = (data: FormData) => {
    setError("");
    const payload = {
      ...data,
      last_activity_at: data.last_activity_at || undefined,
    } as unknown as Enrollment;

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } },
        {
          onSuccess: () => navigate(`/enrollments/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload },
        {
          onSuccess: (result) => navigate(`/enrollments/${result.id}`),
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
          <Link to="/enrollments">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Редагувати запис на курс" : "Створити запис на курс"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Студент</Label>
              <Controller
                control={form.control}
                name="user_id"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть студента</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
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
              <Label>Курс</Label>
              <Controller
                control={form.control}
                name="course_id"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть курс</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
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
              <Label>Статус</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть статус</option>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
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
              <Label>% виконання</Label>
              <Controller
                control={form.control}
                name="completion_percent"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
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
              <Label>Остання активність</Label>
              <Controller
                control={form.control}
                name="last_activity_at"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ?? ""}
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

export default EnrollmentMutate;

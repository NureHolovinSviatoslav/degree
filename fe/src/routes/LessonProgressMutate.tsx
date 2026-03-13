import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { LessonProgress } from "../types/LessonProgress";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonProgressMutation } from "../features/useLessonProgressMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useLessonQuery } from "../features/useLessonQuery";
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

const schema = yup.object({
  user_id: yup.string().required("Заповніть поле"),
  lesson_id: yup.string().required("Заповніть поле"),
  is_viewed: yup.boolean().required(),
  test_score: yup
    .number()
    .required("Заповніть поле")
    .min(0)
    .max(100)
    .typeError("Має бути числом"),
  completed_at: yup.string().optional().nullable(),
});

type FormData = yup.InferType<typeof schema>;

export const LessonProgressMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(
    useLessonProgressQuery,
    setError,
  );
  const mutation = useLessonProgressMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();
  const { data: lessons = [] } = useLessonQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: {
      is_viewed: false,
      test_score: 0,
    },
    values: values
      ? {
          user_id: values.user_id,
          lesson_id: values.lesson_id,
          is_viewed: values.is_viewed,
          test_score: values.test_score,
          completed_at: values.completed_at ?? "",
        }
      : undefined,
    resetOptions: { keepDefaultValues: true },
  });

  const onSubmit = (data: FormData) => {
    setError("");
    const payload = {
      ...data,
      completed_at: data.completed_at || undefined,
    } as unknown as LessonProgress;

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } },
        {
          onSuccess: () => navigate(`/lesson-progress/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload },
        {
          onSuccess: (result) => navigate(`/lesson-progress/${result.id}`),
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
          <Link to="/lesson-progress">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Редагувати прогрес уроку" : "Створити прогрес уроку"}
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
              <Label>Урок</Label>
              <Controller
                control={form.control}
                name="lesson_id"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть урок</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
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

            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="is_viewed"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="h-4 w-4 rounded border-input"
                    id="is_viewed"
                  />
                )}
              />
              <Label htmlFor="is_viewed">Переглянуто</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Бал тесту</Label>
              <Controller
                control={form.control}
                name="test_score"
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
              <Label>Завершено</Label>
              <Controller
                control={form.control}
                name="completed_at"
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

export default LessonProgressMutate;

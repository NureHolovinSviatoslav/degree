import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { Course } from "../types/Course";
import { useCourseQuery } from "../features/useCourseQuery";
import { useCourseMutation } from "../features/useCourseMutation";
import { useUserQuery } from "../features/useUserQuery";
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
  title: yup.string().required("Заповніть поле"),
  description: yup.string().optional(),
  teacher_id: yup.string().required("Заповніть поле"),
  is_published: yup.boolean().required(),
});

type FormData = yup.InferType<typeof schema>;

export const CourseMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(useCourseQuery, setError);
  const mutation = useCourseMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? {
          title: values.title,
          description: values.description ?? "",
          teacher_id: values.teacher_id,
          is_published: values.is_published,
        }
      : undefined,
    defaultValues: {
      title: "",
      description: "",
      teacher_id: "",
      is_published: false,
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      teacher_id: data.teacher_id,
      is_published: data.is_published,
    };

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as Course },
        {
          onSuccess: () => navigate(`/courses/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as Course },
        {
          onSuccess: (result) => navigate(`/courses/${result.id}`),
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
          <Link to="/courses">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Редагувати курс" : "Створити курс"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Назва</Label>
              <Controller
                control={form.control}
                name="title"
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
              <Label>Опис</Label>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <>
                    <textarea
                      {...field}
                      value={field.value ?? ""}
                      className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
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
              <Label>Викладач</Label>
              <Controller
                control={form.control}
                name="teacher_id"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть викладача</option>
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

            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="h-4 w-4 rounded border-input"
                  />
                )}
              />
              <Label>Опубліковано</Label>
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

export default CourseMutate;

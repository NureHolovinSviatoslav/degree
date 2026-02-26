import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { Lesson } from "../types/Lesson";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonMutation } from "../features/useLessonMutation";
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

const schema = yup.object({
  title: yup.string().required("Заповніть поле"),
  course_id: yup.string().required("Заповніть поле"),
  video_url: yup.string().required("Заповніть поле").url("Невірний формат URL"),
  transcription: yup.string().required("Заповніть поле"),
  position: yup
    .number()
    .required("Заповніть поле")
    .min(1, "Мінімум 1")
    .typeError("Має бути числом"),
});

type FormData = yup.InferType<typeof schema>;

export const LessonMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(useLessonQuery, setError);
  const mutation = useLessonMutation();
  const navigate = useNavigate();
  const { data: courses = [] } = useCourseQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? {
          title: values.title,
          course_id: values.course_id,
          video_url: values.video_url,
          transcription: values.transcription,
          position: values.position,
        }
      : undefined,
    defaultValues: {
      title: "",
      course_id: "",
      video_url: "",
      transcription: "",
      position: 1,
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      course_id: data.course_id,
      video_url: data.video_url,
      transcription: data.transcription,
      position: data.position,
    };

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as Lesson },
        {
          onSuccess: () => navigate(`/lessons/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as Lesson },
        {
          onSuccess: (result) => navigate(`/lessons/${result.id}`),
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
          <Link to="/lessons">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Редагувати урок" : "Створити урок"}</CardTitle>
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
              <Label>Відео URL</Label>
              <Controller
                control={form.control}
                name="video_url"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://..."
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
              <Label>Транскрипція</Label>
              <Controller
                control={form.control}
                name="transcription"
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
              <Label>Позиція</Label>
              <Controller
                control={form.control}
                name="position"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      type="number"
                      min={1}
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

            <Button type="submit" disabled={mutation.isLoading}>
              {isEdit ? "Зберегти" : "Створити"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonMutate;

import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import Loader from "../components/Loader";
import { useLessonQuery } from "../features/useLessonQuery";
import { useTestQuestionMutation } from "../features/useTestQuestionMutation";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { TestQuestion } from "../types/TestQuestion";
import { useEdit } from "../utils/useEdit";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";

const schema = yup.object({
  lesson_id: yup.string().required("Заповніть поле"),
  question_text: yup.string().required("Заповніть поле"),
});

type FormData = yup.InferType<typeof schema>;

export const TestQuestionMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, isLoading, values } = useEdit(
    useTestQuestionQuery,
    setError,
  );
  const mutation = useTestQuestionMutation();
  const navigate = useNavigate();

  const lessonQuery = useLessonQuery();
  const lessons = useMemo(() => lessonQuery.data ?? [], [lessonQuery.data]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values as FormData | undefined,
  });

  const onSubmit = (data: FormData) => {
    setError("");
    const payload = isEdit
      ? { type: "update" as const, data: { ...data, id: id! } as TestQuestion }
      : {
          type: "create" as const,
          data: { ...data, id: undefined } as unknown as TestQuestion,
        };

    mutation
      .mutateAsync(payload)
      .then((res) => navigate(`/test-questions/${res.id}`))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/test-questions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit
              ? `Редагувати тестове питання #${id}`
              : "Створити тестове питання"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Урок</Label>
              <Controller
                name="lesson_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Оберіть урок</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.lesson_id && (
                <p className="text-xs text-red-600">
                  {errors.lesson_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Текст питання</Label>
              <Controller
                name="question_text"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                )}
              />
              {errors.question_text && (
                <p className="text-xs text-red-600">
                  {errors.question_text.message}
                </p>
              )}
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

export default TestQuestionMutate;

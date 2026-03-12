import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import Loader from "../components/Loader";
import { useAnswerOptionMutation } from "../features/useAnswerOptionMutation";
import { useAnswerOptionQuery } from "../features/useAnswerOptionQuery";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { AnswerOption } from "../types/AnswerOption";
import { useEdit } from "../utils/useEdit";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const schema = yup.object({
  question_id: yup.string().required("Заповніть поле"),
  option_text: yup.string().required("Заповніть поле"),
  is_correct: yup.boolean().required(),
});

type FormData = yup.InferType<typeof schema>;

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export const AnswerOptionMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, isLoading, values } = useEdit(
    useAnswerOptionQuery,
    setError,
  );
  const mutation = useAnswerOptionMutation();
  const navigate = useNavigate();

  const questionQuery = useTestQuestionQuery();
  const questions = useMemo(
    () => questionQuery.data ?? [],
    [questionQuery.data],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? { ...values, is_correct: values.is_correct ?? false }
      : undefined,
  });

  const onSubmit = (data: FormData) => {
    setError("");
    const payload = isEdit
      ? {
          type: "update" as const,
          data: { ...data, id: id! } as AnswerOption,
        }
      : {
          type: "create" as const,
          data: { ...data, id: undefined } as unknown as AnswerOption,
        };

    mutation
      .mutateAsync(payload)
      .then((res) => navigate(`/answer-options/${res.id}`))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/answer-options"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit
              ? `Редагувати варіант відповіді #${id}`
              : "Створити варіант відповіді"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Питання</Label>
              <Controller
                name="question_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Оберіть питання</option>
                    {questions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {truncate(q.question_text, 60)}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.question_id && (
                <p className="text-xs text-red-600">
                  {errors.question_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Текст варіанту</Label>
              <Controller
                name="option_text"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.option_text && (
                <p className="text-xs text-red-600">
                  {errors.option_text.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="is_correct"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="is_correct"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                )}
              />
              <Label htmlFor="is_correct">Правильний варіант</Label>
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

export default AnswerOptionMutate;

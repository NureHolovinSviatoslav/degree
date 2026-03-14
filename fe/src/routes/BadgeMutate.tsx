import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import Loader from "../components/Loader";
import { useBadgeMutation } from "../features/useBadgeMutation";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { Badge as BadgeType } from "../types/Badge";
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
  name: yup.string().required("Заповніть поле"),
  description: yup.string().optional(),
  condition_type: yup
    .string()
    .required("Заповніть поле")
    .oneOf(["course_completion", "activity_streak"]),
});

type FormData = yup.InferType<typeof schema>;

export const BadgeMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, isLoading, values } = useEdit(useBadgeQuery, setError);
  const mutation = useBadgeMutation();
  const navigate = useNavigate();

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
      ? {
          type: "update" as const,
          data: {
            ...data,
            id: id!,
            condition_type: data.condition_type as BadgeType["condition_type"],
          } as BadgeType,
        }
      : {
          type: "create" as const,
          data: {
            ...data,
            id: undefined as unknown as string,
            condition_type: data.condition_type as BadgeType["condition_type"],
          } as BadgeType,
        };

    mutation
      .mutateAsync(payload)
      .then((res) => navigate(`/badges/${res.id}`))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/badges"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? `Редагувати бейдж #${id}` : "Створити бейдж"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Назва</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Опис</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                )}
              />
            </div>

            <div className="space-y-1">
              <Label>Тип умови</Label>
              <Controller
                name="condition_type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Оберіть тип</option>
                    <option value="course_completion">Завершення курсу</option>
                    <option value="activity_streak">Серія активності</option>
                  </select>
                )}
              />
              {errors.condition_type && (
                <p className="text-xs text-red-600">
                  {errors.condition_type.message}
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

export default BadgeMutate;

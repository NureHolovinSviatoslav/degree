import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { UserBadge } from "../types/UserBadge";
import { useUserBadgeQuery } from "../features/useUserBadgeQuery";
import { useUserBadgeMutation } from "../features/useUserBadgeMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { useEdit } from "../utils/useEdit";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import Loader from "../components/Loader";

const schema = yup.object({
  user_id: yup.string().required("Заповніть поле"),
  badge_id: yup.string().required("Заповніть поле"),
  awarded_at: yup.string().optional().nullable(),
});

type FormData = yup.InferType<typeof schema>;

export const UserBadgeMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(
    useUserBadgeQuery,
    setError,
  );
  const mutation = useUserBadgeMutation();
  const navigate = useNavigate();
  const usersQuery = useUserQuery();
  const badgesQuery = useBadgeQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? {
          user_id: values.user_id,
          badge_id: values.badge_id,
          awarded_at: values.awarded_at
            ? new Date(values.awarded_at).toISOString().slice(0, 16)
            : "",
        }
      : undefined,
  });

  const onSubmit = (data: FormData) => {
    const payload: Partial<UserBadge> & { id?: string } = {
      user_id: data.user_id,
      badge_id: data.badge_id,
      awarded_at: data.awarded_at || undefined,
    };

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as UserBadge },
        {
          onSuccess: () => navigate(`/user-badges/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as UserBadge },
        {
          onSuccess: (result) => navigate(`/user-badges/${result.id}`),
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
          <Link to="/user-badges">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit
              ? "Редагувати бейдж користувача"
              : "Створити бейдж користувача"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Користувач</Label>
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
                      <option value="">Оберіть користувача</option>
                      {(usersQuery.data ?? []).map((u) => (
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
              <Label>Бейдж</Label>
              <Controller
                control={form.control}
                name="badge_id"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть бейдж</option>
                      {(badgesQuery.data ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
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
              <Label>Дата нагородження</Label>
              <Controller
                control={form.control}
                name="awarded_at"
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="datetime-local"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

export default UserBadgeMutate;

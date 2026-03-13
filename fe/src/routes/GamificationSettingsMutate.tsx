import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { GamificationSettings } from "../types/GamificationSettings";
import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";
import { useGamificationSettingsMutation } from "../features/useGamificationSettingsMutation";
import { useUserQuery } from "../features/useUserQuery";
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
  badges_enabled: yup.boolean().required(),
  streaks_enabled: yup.boolean().required(),
  notifications_enabled: yup.boolean().required(),
});

type FormData = yup.InferType<typeof schema>;

export const GamificationSettingsMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(
    useGamificationSettingsQuery,
    setError,
  );
  const mutation = useGamificationSettingsMutation();
  const navigate = useNavigate();
  const usersQuery = useUserQuery();

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: values
      ? {
          user_id: values.user_id,
          badges_enabled: values.badges_enabled,
          streaks_enabled: values.streaks_enabled,
          notifications_enabled: values.notifications_enabled,
        }
      : undefined,
    defaultValues: {
      badges_enabled: true,
      streaks_enabled: true,
      notifications_enabled: true,
    },
  });

  const onSubmit = (data: FormData) => {
    const payload: Partial<GamificationSettings> & { id?: string } = {
      user_id: data.user_id,
      badges_enabled: data.badges_enabled,
      streaks_enabled: data.streaks_enabled,
      notifications_enabled: data.notifications_enabled,
    };

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as GamificationSettings },
        {
          onSuccess: () => navigate(`/gamification-settings/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as GamificationSettings },
        {
          onSuccess: (result) =>
            navigate(`/gamification-settings/${result.id}`),
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
          <Link to="/gamification-settings">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit
              ? "Редагувати налаштування гейміфікації"
              : "Створити налаштування гейміфікації"}
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
              <Label>Бейджі увімкнено</Label>
              <Controller
                control={form.control}
                name="badges_enabled"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Серії увімкнено</Label>
              <Controller
                control={form.control}
                name="streaks_enabled"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Сповіщення увімкнено</Label>
              <Controller
                control={form.control}
                name="notifications_enabled"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
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

export default GamificationSettingsMutate;

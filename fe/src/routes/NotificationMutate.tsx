import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";

import { Notification as NotificationType } from "../types/Notification";
import { useNotificationQuery } from "../features/useNotificationQuery";
import { useNotificationMutation } from "../features/useNotificationMutation";
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
  channel: yup.string().required("Заповніть поле").oneOf(["whatsapp"]),
  message: yup.string().required("Заповніть поле"),
  sent_at: yup.string().optional().nullable(),
});

type FormData = yup.InferType<typeof schema>;

export const NotificationMutate = () => {
  const [error, setError] = useState("");
  const { id, isEdit, values, isLoading } = useEdit(
    useNotificationQuery,
    setError,
  );
  const mutation = useNotificationMutation();
  const navigate = useNavigate();
  const usersQuery = useUserQuery();

  const v = values as NotificationType | undefined;

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    values: v
      ? {
          user_id: v.user_id,
          channel: v.channel,
          message: v.message,
          sent_at: v.sent_at
            ? new Date(v.sent_at).toISOString().slice(0, 16)
            : "",
        }
      : undefined,
    defaultValues: {
      channel: "whatsapp",
    },
  });

  const onSubmit = (data: FormData) => {
    const payload: Partial<NotificationType> & { id?: string } = {
      user_id: data.user_id,
      channel: data.channel as "whatsapp",
      message: data.message,
      sent_at: data.sent_at || undefined,
    };

    if (isEdit && id) {
      mutation.mutate(
        { type: "update", data: { ...payload, id } as NotificationType },
        {
          onSuccess: () => navigate(`/notifications/${id}`),
          onError: (err) => setError((err as Error).message),
        },
      );
    } else {
      mutation.mutate(
        { type: "create", data: payload as NotificationType },
        {
          onSuccess: (result) => navigate(`/notifications/${result.id}`),
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
          <Link to="/notifications">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Редагувати сповіщення" : "Створити сповіщення"}
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
              <Label>Канал</Label>
              <Controller
                control={form.control}
                name="channel"
                render={({ field, fieldState }) => (
                  <>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Оберіть канал</option>
                      <option value="whatsapp">WhatsApp</option>
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
              <Label>Повідомлення</Label>
              <Controller
                control={form.control}
                name="message"
                render={({ field, fieldState }) => (
                  <>
                    <textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
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
              <Label>Надіслано</Label>
              <Controller
                control={form.control}
                name="sent_at"
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

export default NotificationMutate;

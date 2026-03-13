import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Notification as NotificationType } from "../types/Notification";
import { User } from "../types/User";
import { useNotificationQuery } from "../features/useNotificationQuery";
import { useNotificationMutation } from "../features/useNotificationMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
};

export const NotificationDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useNotificationQuery, setError);
  const mutation = useNotificationMutation();
  const navigate = useNavigate();
  const usersQuery = useUserQuery();

  const userMap = useMemo(() => {
    const m = new Map<string, User>();
    (usersQuery.data ?? []).forEach((u) => m.set(u.id, u));
    return m;
  }, [usersQuery.data]);

  const handleDelete = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/notifications"),
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  if (isLoading) return <Loader />;

  const v = values as NotificationType | undefined;

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
          <div className="flex items-center justify-between">
            <CardTitle>Деталі сповіщення #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/notifications/update/${id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Видалити
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {v && (
            <div className="grid grid-cols-[160px_1fr] gap-y-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Користувач
              </span>
              <span>{userMap.get(v.user_id)?.name ?? v.user_id}</span>

              <span className="font-medium text-muted-foreground">Канал</span>
              <span>{CHANNEL_LABELS[v.channel] ?? v.channel}</span>

              <span className="font-medium text-muted-foreground">
                Повідомлення
              </span>
              <span className="whitespace-pre-wrap">{v.message}</span>

              <span className="font-medium text-muted-foreground">
                Надіслано
              </span>
              <span>
                {v.sent_at ? new Date(v.sent_at).toLocaleString("uk-UA") : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDetails;

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";
import { useGamificationSettingsMutation } from "../features/useGamificationSettingsMutation";
import { useUserQuery } from "../features/useUserQuery";
import { User } from "../types/User";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const GamificationSettingsDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(
    useGamificationSettingsQuery,
    setError,
  );
  const mutation = useGamificationSettingsMutation();
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
        onSuccess: () => navigate("/gamification-settings"),
        onError: (err) => setError((err as Error).message),
      },
    );
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
          <div className="flex items-center justify-between">
            <CardTitle>Деталі налаштувань #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/gamification-settings/update/${id}`}>
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
          {values && (
            <div className="grid grid-cols-[160px_1fr] gap-y-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Користувач
              </span>
              <span>{userMap.get(values.user_id)?.name ?? values.user_id}</span>

              <span className="font-medium text-muted-foreground">
                Бейджі увімкнено
              </span>
              <span>
                <Badge variant={values.badges_enabled ? "default" : "outline"}>
                  {values.badges_enabled ? "Так" : "Ні"}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                Серії увімкнено
              </span>
              <span>
                <Badge variant={values.streaks_enabled ? "default" : "outline"}>
                  {values.streaks_enabled ? "Так" : "Ні"}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                Сповіщення увімкнено
              </span>
              <span>
                <Badge
                  variant={values.notifications_enabled ? "default" : "outline"}
                >
                  {values.notifications_enabled ? "Так" : "Ні"}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                Створено
              </span>
              <span>
                {values.created_at
                  ? new Date(values.created_at).toLocaleString("uk-UA")
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSettingsDetails;

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { User } from "../types/User";
import { Badge as BadgeType } from "../types/Badge";
import { useUserBadgeQuery } from "../features/useUserBadgeQuery";
import { useUserBadgeMutation } from "../features/useUserBadgeMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const UserBadgeDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useUserBadgeQuery, setError);
  const mutation = useUserBadgeMutation();
  const navigate = useNavigate();
  const usersQuery = useUserQuery();
  const badgesQuery = useBadgeQuery();

  const userMap = useMemo(() => {
    const m = new Map<string, User>();
    (usersQuery.data ?? []).forEach((u) => m.set(u.id, u));
    return m;
  }, [usersQuery.data]);

  const badgeMap = useMemo(() => {
    const m = new Map<string, BadgeType>();
    (badgesQuery.data ?? []).forEach((b) => m.set(b.id, b));
    return m;
  }, [badgesQuery.data]);

  const handleDelete = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/user-badges"),
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
          <Link to="/user-badges">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі бейджа користувача #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/user-badges/update/${id}`}>
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

              <span className="font-medium text-muted-foreground">Бейдж</span>
              <span>
                {badgeMap.get(values.badge_id)?.name ?? values.badge_id}
              </span>

              <span className="font-medium text-muted-foreground">
                Дата нагородження
              </span>
              <span>
                {values.awarded_at
                  ? new Date(values.awarded_at).toLocaleString("uk-UA")
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBadgeDetails;

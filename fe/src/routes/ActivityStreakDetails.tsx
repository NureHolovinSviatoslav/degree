import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useActivityStreakQuery } from "../features/useActivityStreakQuery";
import { useActivityStreakMutation } from "../features/useActivityStreakMutation";
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

export const ActivityStreakDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(
    useActivityStreakQuery,
    setError,
  );
  const mutation = useActivityStreakMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити серію активності?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/activity-streaks"),
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
          <Link to="/activity-streaks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі серії активності #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/activity-streaks/update/${id}`}>
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
              <span className="font-medium text-muted-foreground">Студент</span>
              <span>{userMap.get(values.user_id)?.name ?? values.user_id}</span>

              <span className="font-medium text-muted-foreground">
                Поточна серія
              </span>
              <span>{values.current_count}</span>

              <span className="font-medium text-muted-foreground">
                Остання активність
              </span>
              <span>
                {values.last_active_date
                  ? new Date(values.last_active_date).toLocaleDateString(
                      "uk-UA",
                    )
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStreakDetails;

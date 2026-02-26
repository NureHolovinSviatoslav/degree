import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { ActivityStreak } from "../types/ActivityStreak";
import { useActivityStreakQuery } from "../features/useActivityStreakQuery";
import { useActivityStreakMutation } from "../features/useActivityStreakMutation";
import { useUserQuery } from "../features/useUserQuery";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const ActivityStreakSearch = () => {
  const query = useActivityStreakQuery();
  const mutation = useActivityStreakMutation();
  const { data: users = [] } = useUserQuery();
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((s: ActivityStreak) => {
      if (filterUserId && s.user_id !== filterUserId) return false;
      return true;
    });
  }, [query.data, filterUserId]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити серію активності?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      { onError: (err) => setError((err as Error).message) },
    );
  };

  if (query.isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Серії активності</CardTitle>
            <Button asChild size="sm">
              <Link to="/activity-streaks/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-1 max-w-xs">
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі студенти</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Студент</th>
                  <th className="pb-2 font-medium">Поточна серія</th>
                  <th className="pb-2 font-medium">Остання активність</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: ActivityStreak) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/activity-streaks/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {userMap.get(row.user_id)?.name ?? row.user_id}
                      </Link>
                    </td>
                    <td className="py-2">{row.current_count}</td>
                    <td className="py-2">
                      {row.last_active_date
                        ? new Date(row.last_active_date).toLocaleDateString(
                            "uk-UA",
                          )
                        : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/activity-streaks/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/activity-streaks/update/${row.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Даних немає
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStreakSearch;

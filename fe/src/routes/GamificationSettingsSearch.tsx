import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { GamificationSettings } from "../types/GamificationSettings";
import { User } from "../types/User";
import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";
import { useGamificationSettingsMutation } from "../features/useGamificationSettingsMutation";
import { useUserQuery } from "../features/useUserQuery";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const GamificationSettingsSearch = () => {
  const query = useGamificationSettingsQuery();
  const mutation = useGamificationSettingsMutation();
  const usersQuery = useUserQuery();
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  const userMap = useMemo(() => {
    const m = new Map<string, User>();
    (usersQuery.data ?? []).forEach((u) => m.set(u.id, u));
    return m;
  }, [usersQuery.data]);

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((s: GamificationSettings) => {
      if (filterUserId && s.user_id !== filterUserId) return false;
      return true;
    });
  }, [query.data, filterUserId]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити?")) return;
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
            <CardTitle>Налаштування гейміфікації</CardTitle>
            <Button asChild size="sm">
              <Link to="/gamification-settings/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі користувачі</option>
              {(usersQuery.data ?? []).map((u) => (
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
                  <th className="pb-2 font-medium">Користувач</th>
                  <th className="pb-2 font-medium">Бейджі</th>
                  <th className="pb-2 font-medium">Серії</th>
                  <th className="pb-2 font-medium">Сповіщення</th>
                  <th className="pb-2 font-medium">Створено</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: GamificationSettings) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/gamification-settings/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {userMap.get(row.user_id)?.name ?? row.user_id}
                      </Link>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={row.badges_enabled ? "default" : "outline"}
                      >
                        {row.badges_enabled ? "Так" : "Ні"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={row.streaks_enabled ? "default" : "outline"}
                      >
                        {row.streaks_enabled ? "Так" : "Ні"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          row.notifications_enabled ? "default" : "outline"
                        }
                      >
                        {row.notifications_enabled ? "Так" : "Ні"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString("uk-UA")
                        : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/gamification-settings/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/gamification-settings/update/${row.id}`}>
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
                      colSpan={6}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Нічого не знайдено
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

export default GamificationSettingsSearch;

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { UserBadge } from "../types/UserBadge";
import { User } from "../types/User";
import { Badge as BadgeType } from "../types/Badge";
import { useUserBadgeQuery } from "../features/useUserBadgeQuery";
import { useUserBadgeMutation } from "../features/useUserBadgeMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const UserBadgeSearch = () => {
  const query = useUserBadgeQuery();
  const mutation = useUserBadgeMutation();
  const usersQuery = useUserQuery();
  const badgesQuery = useBadgeQuery();
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterBadgeId, setFilterBadgeId] = useState("");

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

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((ub: UserBadge) => {
      if (filterUserId && ub.user_id !== filterUserId) return false;
      if (filterBadgeId && ub.badge_id !== filterBadgeId) return false;
      return true;
    });
  }, [query.data, filterUserId, filterBadgeId]);

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
            <CardTitle>Бейджі користувачів</CardTitle>
            <Button asChild size="sm">
              <Link to="/user-badges/create">
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
            <select
              value={filterBadgeId}
              onChange={(e) => setFilterBadgeId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі бейджі</option>
              {(badgesQuery.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Користувач</th>
                  <th className="pb-2 font-medium">Бейдж</th>
                  <th className="pb-2 font-medium">Дата нагородження</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: UserBadge) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/user-badges/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {userMap.get(row.user_id)?.name ?? row.user_id}
                      </Link>
                    </td>
                    <td className="py-2">
                      {badgeMap.get(row.badge_id)?.name ?? row.badge_id}
                    </td>
                    <td className="py-2">
                      {row.awarded_at
                        ? new Date(row.awarded_at).toLocaleString("uk-UA")
                        : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/user-badges/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/user-badges/update/${row.id}`}>
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

export default UserBadgeSearch;

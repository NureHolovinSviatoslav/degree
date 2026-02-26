import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";

import { User, UserRole } from "../types/User";
import { useUserQuery } from "../features/useUserQuery";
import { useUserMutation } from "../features/useUserMutation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import Loader from "../components/Loader";

const ROLE_LABELS: Record<string, string> = {
  admin: "Адміністратор",
  teacher: "Викладач",
  student: "Студент",
};

export const UserSearch = () => {
  const query = useUserQuery();
  const mutation = useUserMutation();
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((u: User) => {
      if (
        filterName &&
        !u.name.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterRole && u.role !== filterRole) return false;
      if (
        filterEmail &&
        !u.email.toLowerCase().includes(filterEmail.toLowerCase())
      )
        return false;
      return true;
    });
  }, [query.data, filterName, filterRole, filterEmail]);

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
            <CardTitle>Користувачі</CardTitle>
            <Button asChild size="sm">
              <Link to="/users/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ім'я"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі ролі</option>
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
            <Input
              placeholder="Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Ім'я</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Роль</th>
                  <th className="pb-2 font-medium">Телефон</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: User) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/users/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-2">{row.email}</td>
                    <td className="py-2">
                      {ROLE_LABELS[row.role ?? ""] ?? row.role}
                    </td>
                    <td className="py-2">{row.phone ?? "—"}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/users/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/users/update/${row.id}`}>
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
                      colSpan={5}
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

export default UserSearch;

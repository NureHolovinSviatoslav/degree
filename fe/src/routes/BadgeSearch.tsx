import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { useBadgeQuery } from "../features/useBadgeQuery";
import { useBadgeMutation } from "../features/useBadgeMutation";
import { Badge as BadgeType } from "../types/Badge";

import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

const CONDITION_LABELS: Record<BadgeType["condition_type"], string> = {
  course_completion: "Завершення курсу",
  activity_streak: "Серія активності",
};

export const BadgeSearch = () => {
  const query = useBadgeQuery();
  const mutation = useBadgeMutation();
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const name = (searchParams.get("name") ?? "").toLowerCase();
    const conditionType = searchParams.get("condition_type") ?? "";
    return rows.filter((row) => {
      const nameOk = !name || row.name.toLowerCase().includes(name);
      const conditionOk =
        !conditionType || row.condition_type === conditionType;
      return nameOk && conditionOk;
    });
  }, [searchParams, rows]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити бейдж?")) return;
    setError("");
    mutation
      .mutateAsync({ type: "delete", data: { id } })
      .catch((e: Error) => setError(e.message));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Бейджі</CardTitle>
            <Link to="/badges/create">
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Назва</Label>
              <Input
                placeholder="Пошук..."
                value={searchParams.get("name") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set("name", e.target.value);
                  else next.delete("name");
                  setSearchParams(next);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Тип умови</Label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={searchParams.get("condition_type") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value)
                    next.set("condition_type", e.target.value);
                  else next.delete("condition_type");
                  setSearchParams(next);
                }}
              >
                <option value="">Всі</option>
                <option value="course_completion">Завершення курсу</option>
                <option value="activity_streak">Серія активності</option>
              </select>
            </div>
          </div>

          {query.isLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Завантаження...
            </p>
          ) : filteredRows.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Даних немає
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-2 font-medium">Назва</th>
                    <th className="px-3 py-2 font-medium">Опис</th>
                    <th className="px-3 py-2 font-medium">Тип умови</th>
                    <th className="px-3 py-2 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link
                          to={`/badges/${row.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.description
                          ? row.description.length > 60
                            ? row.description.slice(0, 60) + "…"
                            : row.description
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">
                          {CONDITION_LABELS[row.condition_type] ??
                            row.condition_type}
                        </Badge>
                      </td>
                      <td className="flex items-center gap-1 px-3 py-2">
                        <Link to={`/badges/${row.id}`}>
                          <Button variant="ghost" size="icon-xs">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/badges/update/${row.id}`}>
                          <Button variant="ghost" size="icon-xs">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeSearch;

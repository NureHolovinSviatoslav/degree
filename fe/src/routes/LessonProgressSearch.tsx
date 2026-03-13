import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { LessonProgress } from "../types/LessonProgress";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonProgressMutation } from "../features/useLessonProgressMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Loader from "../components/Loader";

export const LessonProgressSearch = () => {
  const query = useLessonProgressQuery();
  const mutation = useLessonProgressMutation();
  const { data: users = [] } = useUserQuery();
  const { data: lessons = [] } = useLessonQuery();
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterLessonId, setFilterLessonId] = useState("");

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const lessonMap = useMemo(
    () => new Map(lessons.map((l) => [l.id, l])),
    [lessons],
  );

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((lp: LessonProgress) => {
      if (filterUserId && lp.user_id !== filterUserId) return false;
      if (filterLessonId && lp.lesson_id !== filterLessonId) return false;
      return true;
    });
  }, [query.data, filterUserId, filterLessonId]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити прогрес уроку?")) return;
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
            <CardTitle>Прогрес уроків</CardTitle>
            <Button asChild size="sm">
              <Link to="/lesson-progress/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <select
              value={filterLessonId}
              onChange={(e) => setFilterLessonId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі уроки</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Студент</th>
                  <th className="pb-2 font-medium">Урок</th>
                  <th className="pb-2 font-medium">Переглянуто</th>
                  <th className="pb-2 font-medium">Бал тесту</th>
                  <th className="pb-2 font-medium">Завершено</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: LessonProgress) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      {userMap.get(row.user_id)?.name ?? row.user_id}
                    </td>
                    <td className="py-2">
                      <Link
                        to={`/lesson-progress/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {lessonMap.get(row.lesson_id)?.title ?? row.lesson_id}
                      </Link>
                    </td>
                    <td className="py-2">
                      <Badge variant={row.is_viewed ? "default" : "secondary"}>
                        {row.is_viewed ? "Так" : "Ні"}
                      </Badge>
                    </td>
                    <td className="py-2">{row.test_score}</td>
                    <td className="py-2">
                      {row.completed_at
                        ? new Date(row.completed_at).toLocaleString("uk-UA")
                        : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/lesson-progress/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/lesson-progress/update/${row.id}`}>
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

export default LessonProgressSearch;

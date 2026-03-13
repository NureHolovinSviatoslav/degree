import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { useTestQuestionMutation } from "../features/useTestQuestionMutation";
import { useLessonQuery } from "../features/useLessonQuery";
import { Lesson } from "../types/Lesson";

import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const TestQuestionSearch = () => {
  const query = useTestQuestionQuery();
  const lessonQuery = useLessonQuery();
  const mutation = useTestQuestionMutation();
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const lessons = useMemo(() => lessonQuery.data ?? [], [lessonQuery.data]);
  const lessonMap = useMemo(
    () => new Map<string, Lesson>(lessons.map((l) => [l.id, l])),
    [lessons],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const text = (searchParams.get("question_text") ?? "").toLowerCase();
    const lessonId = searchParams.get("lesson_id") ?? "";
    return rows.filter((row) => {
      const textOk = !text || row.question_text.toLowerCase().includes(text);
      const lessonOk = !lessonId || row.lesson_id === lessonId;
      return textOk && lessonOk;
    });
  }, [searchParams, rows]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити тестове питання?")) return;
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
            <CardTitle>Тестові питання</CardTitle>
            <Link to="/test-questions/create">
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
              <Label>Текст питання</Label>
              <Input
                placeholder="Пошук..."
                value={searchParams.get("question_text") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set("question_text", e.target.value);
                  else next.delete("question_text");
                  setSearchParams(next);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Урок</Label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={searchParams.get("lesson_id") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set("lesson_id", e.target.value);
                  else next.delete("lesson_id");
                  setSearchParams(next);
                }}
              >
                <option value="">Всі</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
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
                    <th className="px-3 py-2 font-medium">Текст питання</th>
                    <th className="px-3 py-2 font-medium">Урок</th>
                    <th className="px-3 py-2 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link
                          to={`/test-questions/${row.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {row.question_text.length > 80
                            ? row.question_text.slice(0, 80) + "…"
                            : row.question_text}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {lessonMap.get(row.lesson_id)?.title ?? row.lesson_id}
                      </td>
                      <td className="flex items-center gap-1 px-3 py-2">
                        <Link to={`/test-questions/${row.id}`}>
                          <Button variant="ghost" size="icon-xs">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/test-questions/update/${row.id}`}>
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

export default TestQuestionSearch;

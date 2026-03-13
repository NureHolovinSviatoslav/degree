import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { useAnswerOptionQuery } from "../features/useAnswerOptionQuery";
import { useAnswerOptionMutation } from "../features/useAnswerOptionMutation";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { TestQuestion } from "../types/TestQuestion";

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

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export const AnswerOptionSearch = () => {
  const query = useAnswerOptionQuery();
  const questionQuery = useTestQuestionQuery();
  const mutation = useAnswerOptionMutation();
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const questions = useMemo(
    () => questionQuery.data ?? [],
    [questionQuery.data],
  );
  const questionMap = useMemo(
    () => new Map<string, TestQuestion>(questions.map((q) => [q.id, q])),
    [questions],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const filteredRows = useMemo(() => {
    const text = (searchParams.get("option_text") ?? "").toLowerCase();
    const questionId = searchParams.get("question_id") ?? "";
    return rows.filter((row) => {
      const textOk = !text || row.option_text.toLowerCase().includes(text);
      const questionOk = !questionId || row.question_id === questionId;
      return textOk && questionOk;
    });
  }, [searchParams, rows]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити варіант відповіді?")) return;
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
            <CardTitle>Варіанти відповідей</CardTitle>
            <Link to="/answer-options/create">
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
              <Label>Текст варіанту</Label>
              <Input
                placeholder="Пошук..."
                value={searchParams.get("option_text") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set("option_text", e.target.value);
                  else next.delete("option_text");
                  setSearchParams(next);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Питання</Label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={searchParams.get("question_id") ?? ""}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set("question_id", e.target.value);
                  else next.delete("question_id");
                  setSearchParams(next);
                }}
              >
                <option value="">Всі</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {truncate(q.question_text, 60)}
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
                    <th className="px-3 py-2 font-medium">Текст варіанту</th>
                    <th className="px-3 py-2 font-medium">Питання</th>
                    <th className="px-3 py-2 font-medium">Правильний</th>
                    <th className="px-3 py-2 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link
                          to={`/answer-options/${row.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {row.option_text}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {truncate(
                          questionMap.get(row.question_id)?.question_text ??
                            row.question_id,
                          60,
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.is_correct ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            Так
                          </Badge>
                        ) : (
                          <Badge variant="outline">Ні</Badge>
                        )}
                      </td>
                      <td className="flex items-center gap-1 px-3 py-2">
                        <Link to={`/answer-options/${row.id}`}>
                          <Button variant="ghost" size="icon-xs">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/answer-options/update/${row.id}`}>
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

export default AnswerOptionSearch;

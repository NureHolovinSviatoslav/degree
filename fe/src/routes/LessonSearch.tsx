import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";

import { Lesson } from "../types/Lesson";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonMutation } from "../features/useLessonMutation";
import { useCourseQuery } from "../features/useCourseQuery";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import Loader from "../components/Loader";

export const LessonSearch = () => {
  const query = useLessonQuery();
  const mutation = useLessonMutation();
  const { data: courses = [] } = useCourseQuery();
  const [error, setError] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");

  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c.title])),
    [courses],
  );

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((l: Lesson) => {
      if (
        filterTitle &&
        !l.title.toLowerCase().includes(filterTitle.toLowerCase())
      )
        return false;
      if (filterCourseId && l.course_id !== filterCourseId) return false;
      return true;
    });
  }, [query.data, filterTitle, filterCourseId]);

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
            <CardTitle>Уроки</CardTitle>
            <Button asChild size="sm">
              <Link to="/lessons/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Створити
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Назва"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі курси</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Назва</th>
                  <th className="pb-2 font-medium">Курс</th>
                  <th className="pb-2 font-medium">Позиція</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: Lesson) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/lessons/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="py-2">
                      {courseMap.get(row.course_id) ?? row.course_id}
                    </td>
                    <td className="py-2">{row.position}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/lessons/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/lessons/update/${row.id}`}>
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

export default LessonSearch;

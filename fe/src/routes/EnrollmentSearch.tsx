import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { Enrollment } from "../types/Enrollment";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useEnrollmentMutation } from "../features/useEnrollmentMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useCourseQuery } from "../features/useCourseQuery";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Loader from "../components/Loader";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процесі",
  completed: "Завершено",
};

export const EnrollmentSearch = () => {
  const query = useEnrollmentQuery();
  const mutation = useEnrollmentMutation();
  const { data: users = [] } = useUserQuery();
  const { data: courses = [] } = useCourseQuery();
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const rows = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((e: Enrollment) => {
      if (filterUserId && e.user_id !== filterUserId) return false;
      if (filterCourseId && e.course_id !== filterCourseId) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      return true;
    });
  }, [query.data, filterUserId, filterCourseId, filterStatus]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Видалити запис на курс?")) return;
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
            <CardTitle>Записи на курси</CardTitle>
            <Button asChild size="sm">
              <Link to="/enrollments/create">
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
              <option value="">Всі студенти</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Всі статуси</option>
              <option value="in_progress">В процесі</option>
              <option value="completed">Завершено</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Студент</th>
                  <th className="pb-2 font-medium">Курс</th>
                  <th className="pb-2 font-medium">Статус</th>
                  <th className="pb-2 font-medium">% виконання</th>
                  <th className="pb-2 font-medium">Остання активність</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: Enrollment) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      {userMap.get(row.user_id)?.name ?? row.user_id}
                    </td>
                    <td className="py-2">
                      <Link
                        to={`/enrollments/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {courseMap.get(row.course_id)?.title ?? row.course_id}
                      </Link>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          row.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                    </td>
                    <td className="py-2">{row.completion_percent}%</td>
                    <td className="py-2">
                      {row.last_activity_at
                        ? new Date(row.last_activity_at).toLocaleString("uk-UA")
                        : "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/enrollments/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/enrollments/update/${row.id}`}>
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

export default EnrollmentSearch;

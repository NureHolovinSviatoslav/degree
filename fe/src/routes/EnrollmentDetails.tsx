import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useEnrollmentMutation } from "../features/useEnrollmentMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useCourseQuery } from "../features/useCourseQuery";
import { useDetails } from "../utils/useDetails";
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

export const EnrollmentDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useEnrollmentQuery, setError);
  const mutation = useEnrollmentMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();
  const { data: courses = [] } = useCourseQuery();

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити запис на курс?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/enrollments"),
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl p-6">
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/enrollments">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі запису на курс #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/enrollments/update/${id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Видалити
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {values && (
            <div className="grid grid-cols-[160px_1fr] gap-y-3 text-sm">
              <span className="font-medium text-muted-foreground">Студент</span>
              <span>{userMap.get(values.user_id)?.name ?? values.user_id}</span>

              <span className="font-medium text-muted-foreground">Курс</span>
              <span>
                {courseMap.get(values.course_id)?.title ?? values.course_id}
              </span>

              <span className="font-medium text-muted-foreground">Статус</span>
              <span>
                <Badge
                  variant={
                    values.status === "completed" ? "default" : "secondary"
                  }
                >
                  {STATUS_LABELS[values.status] ?? values.status}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                % виконання
              </span>
              <span>{values.completion_percent}%</span>

              <span className="font-medium text-muted-foreground">
                Остання активність
              </span>
              <span>
                {values.last_activity_at
                  ? new Date(values.last_activity_at).toLocaleString("uk-UA")
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentDetails;

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useCourseQuery } from "../features/useCourseQuery";
import { useCourseMutation } from "../features/useCourseMutation";
import { useUserQuery } from "../features/useUserQuery";
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

export const CourseDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useCourseQuery, setError);
  const mutation = useCourseMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();

  const teacherName = useMemo(() => {
    if (!values?.teacher_id) return "—";
    return (
      users.find((u) => u.id === values.teacher_id)?.name ?? values.teacher_id
    );
  }, [users, values]);

  const handleDelete = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/courses"),
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
          <Link to="/courses">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі курсу #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/courses/update/${id}`}>
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
              <span className="font-medium text-muted-foreground">Назва</span>
              <span>{values.title}</span>

              <span className="font-medium text-muted-foreground">Опис</span>
              <span>{values.description ?? "—"}</span>

              <span className="font-medium text-muted-foreground">
                Викладач
              </span>
              <span>{teacherName}</span>

              <span className="font-medium text-muted-foreground">
                Опубліковано
              </span>
              <span>
                <Badge variant={values.is_published ? "default" : "secondary"}>
                  {values.is_published ? "Так" : "Ні"}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                Створено
              </span>
              <span>
                {values.created_at
                  ? new Date(values.created_at).toLocaleDateString("uk-UA")
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetails;

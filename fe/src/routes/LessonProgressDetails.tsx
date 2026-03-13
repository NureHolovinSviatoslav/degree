import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonProgressMutation } from "../features/useLessonProgressMutation";
import { useUserQuery } from "../features/useUserQuery";
import { useLessonQuery } from "../features/useLessonQuery";
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

export const LessonProgressDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(
    useLessonProgressQuery,
    setError,
  );
  const mutation = useLessonProgressMutation();
  const navigate = useNavigate();
  const { data: users = [] } = useUserQuery();
  const { data: lessons = [] } = useLessonQuery();

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const lessonMap = useMemo(
    () => new Map(lessons.map((l) => [l.id, l])),
    [lessons],
  );

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити прогрес уроку?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/lesson-progress"),
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
          <Link to="/lesson-progress">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі прогресу уроку #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/lesson-progress/update/${id}`}>
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

              <span className="font-medium text-muted-foreground">Урок</span>
              <span>
                {lessonMap.get(values.lesson_id)?.title ?? values.lesson_id}
              </span>

              <span className="font-medium text-muted-foreground">
                Переглянуто
              </span>
              <span>
                <Badge variant={values.is_viewed ? "default" : "secondary"}>
                  {values.is_viewed ? "Так" : "Ні"}
                </Badge>
              </span>

              <span className="font-medium text-muted-foreground">
                Бал тесту
              </span>
              <span>{values.test_score}</span>

              <span className="font-medium text-muted-foreground">
                Завершено
              </span>
              <span>
                {values.completed_at
                  ? new Date(values.completed_at).toLocaleString("uk-UA")
                  : "—"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonProgressDetails;

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonMutation } from "../features/useLessonMutation";
import { useCourseQuery } from "../features/useCourseQuery";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const LessonDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useLessonQuery, setError);
  const mutation = useLessonMutation();
  const navigate = useNavigate();
  const { data: courses = [] } = useCourseQuery();

  const courseName = useMemo(() => {
    if (!values?.course_id) return "—";
    return (
      courses.find((c) => c.id === values.course_id)?.title ?? values.course_id
    );
  }, [courses, values]);

  const handleDelete = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/lessons"),
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
          <Link to="/lessons">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі уроку #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/lessons/update/${id}`}>
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

              <span className="font-medium text-muted-foreground">Курс</span>
              <span>{courseName}</span>

              <span className="font-medium text-muted-foreground">
                Відео URL
              </span>
              <span>
                <a
                  href={values.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {values.video_url}
                </a>
              </span>

              <span className="font-medium text-muted-foreground">
                Транскрипція
              </span>
              <span className="whitespace-pre-wrap">
                {values.transcription}
              </span>

              <span className="font-medium text-muted-foreground">Позиція</span>
              <span>{values.position}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetails;

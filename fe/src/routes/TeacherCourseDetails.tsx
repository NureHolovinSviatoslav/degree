import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  GraduationCap,
} from "lucide-react";

import { Lesson } from "../types/Lesson";
import { useCourseQuery } from "../features/useCourseQuery";
import { useCourseMutation } from "../features/useCourseMutation";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonMutation } from "../features/useLessonMutation";
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

export const TeacherCourseDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useCourseQuery, setError);
  const courseMutation = useCourseMutation();
  const lessonMutation = useLessonMutation();
  const navigate = useNavigate();
  const { data: allLessons = [] } = useLessonQuery();

  const lessons = useMemo(
    () =>
      allLessons
        .filter((l: Lesson) => l.course_id === id)
        .sort((a: Lesson, b: Lesson) => a.position - b.position),
    [allLessons, id],
  );

  const handleDeleteCourse = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити курс?")) return;
    courseMutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/teacher-courses"),
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити урок?")) return;
    lessonMutation.mutate(
      { type: "delete", data: { id: lessonId } },
      { onError: (err) => setError((err as Error).message) },
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/teacher-courses">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            До списку курсів
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі курсу</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/teacher-courses/update/${id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteCourse}
              >
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Уроки курсу
            </CardTitle>
            <Button asChild size="sm">
              <Link to={`/teacher-lessons/create?course_id=${id}`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Додати урок
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Назва</th>
                  <th className="pb-2 font-medium">Позиція</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((row: Lesson) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/teacher-lessons/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="py-2">{row.position}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher-lessons/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher-lessons/update/${row.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteLesson(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Уроків ще немає
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

export default TeacherCourseDetails;

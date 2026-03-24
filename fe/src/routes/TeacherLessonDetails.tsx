import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  HelpCircle,
} from "lucide-react";

import { TestQuestion } from "../types/TestQuestion";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonMutation } from "../features/useLessonMutation";
import { useCourseQuery } from "../features/useCourseQuery";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { useTestQuestionMutation } from "../features/useTestQuestionMutation";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

export const TeacherLessonDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useLessonQuery, setError);
  const lessonMutation = useLessonMutation();
  const questionMutation = useTestQuestionMutation();
  const navigate = useNavigate();
  const { data: courses = [] } = useCourseQuery();
  const { data: allQuestions = [] } = useTestQuestionQuery();

  const courseName = useMemo(() => {
    if (!values?.course_id) return "—";
    return (
      courses.find((c) => c.id === values.course_id)?.title ?? values.course_id
    );
  }, [courses, values]);

  const questions = useMemo(
    () => allQuestions.filter((q: TestQuestion) => q.lesson_id === id),
    [allQuestions, id],
  );

  const handleDeleteLesson = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити урок?")) return;
    lessonMutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () =>
          navigate(`/teacher-courses/${values?.course_id ?? ""}`),
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити питання?")) return;
    questionMutation
      .mutateAsync({ type: "delete", data: { id: questionId } })
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/teacher-courses/${values?.course_id ?? ""}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            До курсу
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі уроку</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/teacher-lessons/update/${id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteLesson}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Тестові питання
            </CardTitle>
            <Button asChild size="sm">
              <Link to={`/teacher-questions/create?lesson_id=${id}`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Додати питання
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Текст питання</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((row: TestQuestion) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        to={`/teacher-questions/${row.id}`}
                        className="text-primary hover:underline"
                      >
                        {row.question_text.length > 100
                          ? row.question_text.slice(0, 100) + "…"
                          : row.question_text}
                      </Link>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher-questions/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher-questions/update/${row.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteQuestion(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Питань ще немає
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

export default TeacherLessonDetails;

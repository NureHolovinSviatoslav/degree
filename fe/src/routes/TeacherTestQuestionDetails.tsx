import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Plus, ListChecks } from "lucide-react";

import { AnswerOption } from "../types/AnswerOption";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { useTestQuestionMutation } from "../features/useTestQuestionMutation";
import { useLessonQuery } from "../features/useLessonQuery";
import { useAnswerOptionQuery } from "../features/useAnswerOptionQuery";
import { useAnswerOptionMutation } from "../features/useAnswerOptionMutation";
import { Lesson } from "../types/Lesson";
import { useDetails } from "../utils/useDetails";
import Loader from "../components/Loader";

import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export const TeacherTestQuestionDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useTestQuestionQuery, setError);
  const questionMutation = useTestQuestionMutation();
  const answerMutation = useAnswerOptionMutation();
  const navigate = useNavigate();

  const lessonQuery = useLessonQuery();
  const lessonMap = useMemo(
    () =>
      new Map<string, Lesson>((lessonQuery.data ?? []).map((l) => [l.id, l])),
    [lessonQuery.data],
  );

  const { data: allAnswers = [] } = useAnswerOptionQuery();
  const answers = useMemo(
    () => allAnswers.filter((a: AnswerOption) => a.question_id === id),
    [allAnswers, id],
  );

  const handleDeleteQuestion = () => {
    if (!id || !window.confirm("Видалити тестове питання?")) return;
    setError("");
    questionMutation
      .mutateAsync({ type: "delete", data: { id } })
      .then(() => navigate(`/teacher-lessons/${values?.lesson_id ?? ""}`))
      .catch((e: Error) => setError(e.message));
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (!window.confirm("Видалити варіант відповіді?")) return;
    setError("");
    answerMutation
      .mutateAsync({ type: "delete", data: { id: answerId } })
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/teacher-lessons/${values?.lesson_id ?? ""}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            До уроку
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі тестового питання</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/teacher-questions/update/${id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteQuestion}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Видалити
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {values ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Текст питання
                </p>
                <p className="mt-1 text-sm">{values.question_text}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Урок
                </p>
                <p className="mt-1 text-sm">
                  {lessonMap.get(values.lesson_id)?.title ?? values.lesson_id}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Даних немає</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Варіанти відповідей
            </CardTitle>
            <Button asChild size="sm">
              <Link to={`/teacher-answers/create?question_id=${id}`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Додати відповідь
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium">Текст варіанту</th>
                  <th className="pb-2 font-medium">Правильний</th>
                  <th className="pb-2 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((row: AnswerOption) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">{row.option_text}</td>
                    <td className="py-2">
                      {row.is_correct ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Так
                        </Badge>
                      ) : (
                        <Badge variant="outline">Ні</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher-answers/update/${row.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteAnswer(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {answers.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Відповідей ще немає
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

export default TeacherTestQuestionDetails;

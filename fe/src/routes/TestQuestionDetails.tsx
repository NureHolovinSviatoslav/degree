import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { useTestQuestionMutation } from "../features/useTestQuestionMutation";
import { useLessonQuery } from "../features/useLessonQuery";
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
import { Separator } from "../components/ui/separator";

export const TestQuestionDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useTestQuestionQuery, setError);
  const mutation = useTestQuestionMutation();
  const navigate = useNavigate();

  const lessonQuery = useLessonQuery();
  const lessonMap = useMemo(
    () =>
      new Map<string, Lesson>((lessonQuery.data ?? []).map((l) => [l.id, l])),
    [lessonQuery.data],
  );

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити тестове питання?")) return;
    setError("");
    mutation
      .mutateAsync({ type: "delete", data: { id } })
      .then(() => navigate("/test-questions"))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/test-questions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі тестового питання #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Link to={`/test-questions/update/${id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Редагувати
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
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
    </div>
  );
};

export default TestQuestionDetails;

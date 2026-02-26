import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useAnswerOptionQuery } from "../features/useAnswerOptionQuery";
import { useAnswerOptionMutation } from "../features/useAnswerOptionMutation";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { TestQuestion } from "../types/TestQuestion";
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

export const AnswerOptionDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useAnswerOptionQuery, setError);
  const mutation = useAnswerOptionMutation();
  const navigate = useNavigate();

  const questionQuery = useTestQuestionQuery();
  const questionMap = useMemo(
    () =>
      new Map<string, TestQuestion>(
        (questionQuery.data ?? []).map((q) => [q.id, q]),
      ),
    [questionQuery.data],
  );

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити варіант відповіді?")) return;
    setError("");
    mutation
      .mutateAsync({ type: "delete", data: { id } })
      .then(() => navigate("/answer-options"))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/answer-options"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі варіанту відповіді #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Link to={`/answer-options/update/${id}`}>
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
                  Текст варіанту
                </p>
                <p className="mt-1 text-sm">{values.option_text}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Питання
                </p>
                <p className="mt-1 text-sm">
                  {questionMap.get(values.question_id)?.question_text ??
                    values.question_id}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Правильний
                </p>
                <div className="mt-1">
                  {values.is_correct ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Так
                    </Badge>
                  ) : (
                    <Badge variant="outline">Ні</Badge>
                  )}
                </div>
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

export default AnswerOptionDetails;

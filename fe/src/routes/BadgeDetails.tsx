import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useBadgeQuery } from "../features/useBadgeQuery";
import { useBadgeMutation } from "../features/useBadgeMutation";
import { Badge as BadgeType } from "../types/Badge";
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

const CONDITION_LABELS: Record<BadgeType["condition_type"], string> = {
  course_completion: "Завершення курсу",
  activity_streak: "Серія активності",
};

export const BadgeDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useBadgeQuery, setError);
  const mutation = useBadgeMutation();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!id || !window.confirm("Видалити бейдж?")) return;
    setError("");
    mutation
      .mutateAsync({ type: "delete", data: { id } })
      .then(() => navigate("/badges"))
      .catch((e: Error) => setError(e.message));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        to="/badges"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        До списку
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі бейджа #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Link to={`/badges/update/${id}`}>
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
                  Назва
                </p>
                <p className="mt-1 text-sm">{values.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Тип умови
                </p>
                <div className="mt-1">
                  <Badge variant="outline">
                    {CONDITION_LABELS[values.condition_type] ??
                      values.condition_type}
                  </Badge>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Опис
                </p>
                <p className="mt-1 text-sm">{values.description || "—"}</p>
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

export default BadgeDetails;

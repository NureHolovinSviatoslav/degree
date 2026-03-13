import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { useUserQuery } from "../features/useUserQuery";
import { useUserMutation } from "../features/useUserMutation";
import { useDetails } from "../utils/useDetails";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import Loader from "../components/Loader";

const ROLE_LABELS: Record<string, string> = {
  admin: "Адміністратор",
  teacher: "Викладач",
  student: "Студент",
};

export const UserDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useUserQuery, setError);
  const mutation = useUserMutation();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!id || !window.confirm("Ви впевнені, що хочете видалити?")) return;
    mutation.mutate(
      { type: "delete", data: { id } },
      {
        onSuccess: () => navigate("/users"),
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
          <Link to="/users">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Назад
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Деталі користувача #{id}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/users/update/${id}`}>
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
              <span className="font-medium text-muted-foreground">Ім'я</span>
              <span>{values.name}</span>

              <span className="font-medium text-muted-foreground">Email</span>
              <span>{values.email}</span>

              <span className="font-medium text-muted-foreground">Роль</span>
              <span>
                {ROLE_LABELS[values.role ?? ""] ?? values.role ?? "—"}
              </span>

              <span className="font-medium text-muted-foreground">Телефон</span>
              <span>{values.phone ?? "—"}</span>

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

export default UserDetails;

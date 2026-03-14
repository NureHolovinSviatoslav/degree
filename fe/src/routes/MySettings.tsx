import { useContext, useEffect, useMemo, useState } from "react";
import { Award, Bell, Flame, Save, Settings } from "lucide-react";

import { CurrentUserContext } from "../App";
import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";
import { useGamificationSettingsMutation } from "../features/useGamificationSettingsMutation";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

const SETTINGS_OPTIONS = [
  {
    key: "badges_enabled" as const,
    icon: Award,
    label: "Бейджі",
    description: "Отримуйте нагороди за досягнення у навчанні",
  },
  {
    key: "streaks_enabled" as const,
    icon: Flame,
    label: "Серії активності",
    description: "Відстежуйте послідовні дні навчання",
  },
  {
    key: "notifications_enabled" as const,
    icon: Bell,
    label: "Сповіщення",
    description: "Отримуйте нагадування та оновлення щодо курсів",
  },
];

const MySettings = () => {
  const user = useContext(CurrentUserContext);
  const { data: allSettings = [], isLoading } =
    useGamificationSettingsQuery();
  const mutation = useGamificationSettingsMutation();

  const mySettings = useMemo(
    () => allSettings.find((s) => s.user_id === user.id),
    [allSettings, user.id],
  );

  const [form, setForm] = useState({
    badges_enabled: true,
    streaks_enabled: true,
    notifications_enabled: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mySettings) {
      setForm({
        badges_enabled: mySettings.badges_enabled,
        streaks_enabled: mySettings.streaks_enabled,
        notifications_enabled: mySettings.notifications_enabled,
      });
    }
  }, [mySettings]);

  const hasChanges = mySettings
    ? form.badges_enabled !== mySettings.badges_enabled ||
      form.streaks_enabled !== mySettings.streaks_enabled ||
      form.notifications_enabled !== mySettings.notifications_enabled
    : true;

  const handleSave = () => {
    setSaved(false);

    if (mySettings) {
      mutation.mutate(
        {
          type: "update",
          data: { ...mySettings, ...form },
        },
        {
          onSuccess: () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          },
        },
      );
    } else {
      mutation.mutate(
        {
          type: "create",
          data: {
            id: "",
            user_id: user.id,
            ...form,
          },
        },
        {
          onSuccess: () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          },
        },
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Налаштування</h1>
        <p className="text-muted-foreground">
          Керуйте параметрами гейміфікації та сповіщень
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Гейміфікація
          </CardTitle>
          <CardDescription>
            Оберіть які елементи гейміфікації ви хочете використовувати
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTINGS_OPTIONS.map(({ key, icon: Icon, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <Toggle
                checked={form[key]}
                onChange={(val) => setForm((prev) => ({ ...prev, [key]: val }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || mutation.isLoading}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {mutation.isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Збережено!
          </span>
        )}
      </div>
    </div>
  );
};

export default MySettings;

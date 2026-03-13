import { useContext, useMemo } from "react";
import { useQueryClient } from "react-query";
import {
  LogOut,
  Mail,
  Phone,
  Shield,
  BookOpen,
  Users,
  Eye,
  GraduationCap,
  Trophy,
  Flame,
} from "lucide-react";

import { CurrentUserContext } from "../App";
import { UserRole } from "../types/User";
import { CURRENT_USER_QUERY_KEY } from "../features/useCurrentUserQuery";
import { useCourseQuery } from "../features/useCourseQuery";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useUserBadgeQuery } from "../features/useUserBadgeQuery";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { useActivityStreakQuery } from "../features/useActivityStreakQuery";
import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";

import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";

const ROLE_LABELS: Record<string, string> = {
  admin: "Адміністратор",
  teacher: "Викладач",
  student: "Студент",
};

const BADGE_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  "bg-lime-100 text-lime-800 border-lime-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-teal-100 text-teal-800 border-teal-200",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function UserInfoCard() {
  const user = useContext(CurrentUserContext);
  const queryClient = useQueryClient();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>
                {ROLE_LABELS[user.role ?? ""] ?? user.role}
              </CardDescription>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Вийти
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>{ROLE_LABELS[user.role ?? ""] ?? user.role}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeacherStats() {
  const user = useContext(CurrentUserContext);
  const { data: courses = [] } = useCourseQuery();
  const { data: enrollments = [] } = useEnrollmentQuery();
  const { data: lessons = [] } = useLessonQuery();
  const { data: lessonProgress = [] } = useLessonProgressQuery();

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacher_id === user.id),
    [courses, user.id],
  );

  const totalStudents = useMemo(
    () =>
      new Set(
        enrollments
          .filter((e) => myCourses.some((c) => c.id === e.course_id))
          .map((e) => e.user_id),
      ).size,
    [enrollments, myCourses],
  );

  const totalLessons = useMemo(
    () =>
      lessons.filter((l) => myCourses.some((c) => c.id === l.course_id)).length,
    [lessons, myCourses],
  );

  const totalViews = useMemo(() => {
    const lessonIds = new Set(
      lessons
        .filter((l) => myCourses.some((c) => c.id === l.course_id))
        .map((l) => l.id),
    );
    return lessonProgress.filter(
      (lp) => lessonIds.has(lp.lesson_id) && lp.is_viewed,
    ).length;
  }, [lessons, myCourses, lessonProgress]);

  const stats = [
    { icon: BookOpen, label: "Курсів", value: myCourses.length },
    { icon: Users, label: "Студентів", value: totalStudents },
    { icon: GraduationCap, label: "Уроків", value: totalLessons },
    { icon: Eye, label: "Переглядів", value: totalViews },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Статистика курсів
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-4"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-semibold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentGamification() {
  const user = useContext(CurrentUserContext);
  const { data: settings = [] } = useGamificationSettingsQuery();
  const { data: userBadges = [] } = useUserBadgeQuery();
  const { data: badges = [] } = useBadgeQuery();
  const { data: streaks = [] } = useActivityStreakQuery();

  const mySettings = useMemo(
    () => settings.find((s) => s.user_id === user.id),
    [settings, user.id],
  );

  const badgesEnabled = mySettings?.badges_enabled ?? false;
  const streaksEnabled = mySettings?.streaks_enabled ?? false;

  const myBadges = useMemo(() => {
    if (!badgesEnabled) return [];
    const badgeMap = new Map(badges.map((b) => [b.id, b]));
    return userBadges
      .filter((ub) => ub.user_id === user.id)
      .map((ub) => badgeMap.get(ub.badge_id))
      .filter(Boolean);
  }, [userBadges, badges, user.id, badgesEnabled]);

  const myStreak = useMemo(
    () => (streaksEnabled ? streaks.find((s) => s.user_id === user.id) : null),
    [streaks, user.id, streaksEnabled],
  );

  if (!badgesEnabled && !streaksEnabled) return null;

  return (
    <>
      {streaksEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Серія активності
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <span className="text-2xl font-bold text-orange-600">
                  {myStreak?.current_count ?? 0}
                </span>
              </div>
              <div>
                <p className="font-medium">днів поспіль</p>
                {myStreak?.last_active_date && (
                  <p className="text-sm text-muted-foreground">
                    Остання активність:{" "}
                    {new Date(myStreak.last_active_date).toLocaleDateString(
                      "uk-UA",
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {badgesEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Нагороди
            </CardTitle>
            <CardDescription>
              {myBadges.length > 0
                ? `Отримано ${myBadges.length} бейджів`
                : "Ще немає нагород — продовжуйте навчання!"}
            </CardDescription>
          </CardHeader>
          {myBadges.length > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {myBadges.map((badge) => {
                  const colorClass =
                    BADGE_COLORS[hashString(badge!.id) % BADGE_COLORS.length];
                  return (
                    <span
                      key={badge!.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${colorClass}`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      {badge!.name}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}

export const Profile = () => {
  const user = useContext(CurrentUserContext);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Профіль</h1>

      <UserInfoCard />

      {user.role === UserRole.Teacher && (
        <>
          <Separator />
          <TeacherStats />
        </>
      )}

      {user.role === UserRole.Student && (
        <>
          <Separator />
          <StudentGamification />
        </>
      )}
    </div>
  );
};

export default Profile;

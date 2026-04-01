import {
  BarChart3,
  BookOpen,
  Eye,
  Flame,
  GraduationCap,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useContext, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CurrentUserContext } from "../App";
import { useActivityStreakQuery } from "../features/useActivityStreakQuery";
import { useBadgeQuery } from "../features/useBadgeQuery";
import { useCourseQuery } from "../features/useCourseQuery";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { useGamificationSettingsQuery } from "../features/useGamificationSettingsQuery";
import { useUserBadgeQuery } from "../features/useUserBadgeQuery";
import { UserRole } from "../types/User";

import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

const CHART_COLORS = [
  "oklch(0.809 0.105 251.813)",
  "oklch(0.623 0.214 259.815)",
  "oklch(0.546 0.245 262.881)",
  "oklch(0.488 0.243 264.376)",
  "oklch(0.424 0.199 265.638)",
];

function AdminHome({ name }: { name: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Вітаємо, {name}!</CardTitle>
          <CardDescription>
            Ви увійшли як адміністратор. Використовуйте меню навігації для
            керування платформою.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function StudentHome({ userId, name }: { userId: string; name: string }) {
  const { data: enrollments = [] } = useEnrollmentQuery();
  const { data: courses = [] } = useCourseQuery();
  const { data: streaks = [] } = useActivityStreakQuery();
  const { data: userBadges = [] } = useUserBadgeQuery();
  const { data: badges = [] } = useBadgeQuery();
  const { data: gamSettings = [] } = useGamificationSettingsQuery();

  const myEnrollments = useMemo(
    () => enrollments.filter((e) => e.user_id === userId),
    [enrollments, userId],
  );

  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const myStreak = useMemo(
    () => streaks.find((s) => s.user_id === userId),
    [streaks, userId],
  );

  const myBadges = useMemo(() => {
    const badgeMap = new Map(badges.map((b) => [b.id, b]));
    return userBadges
      .filter((ub) => ub.user_id === userId)
      .map((ub) => badgeMap.get(ub.badge_id))
      .filter(Boolean);
  }, [userBadges, badges, userId]);

  const mySettings = useMemo(
    () => gamSettings.find((s) => s.user_id === userId),
    [gamSettings, userId],
  );
  const streaksEnabled = mySettings?.streaks_enabled ?? true;
  const badgesEnabled = mySettings?.badges_enabled ?? true;

  const inProgressCount = myEnrollments.filter(
    (e) => e.status === "in_progress",
  ).length;
  const completedCount = myEnrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const avgCompletion =
    myEnrollments.length > 0
      ? Math.round(
          myEnrollments.reduce(
            (sum, e) => sum + Number(e.completion_percent),
            0,
          ) / myEnrollments.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Вітаємо, {name}!
        </h1>
        <p className="text-muted-foreground">Ваш навчальний прогрес</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>В процесі</CardDescription>
            <CardTitle className="text-3xl">{inProgressCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">курсів</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Завершено</CardDescription>
            <CardTitle className="text-3xl">{completedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs">курсів</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Середній прогрес</CardDescription>
            <CardTitle className="text-3xl">{avgCompletion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgCompletion} className="h-2" />
          </CardContent>
        </Card>

        {streaksEnabled && (
          <Card>
            <CardHeader>
              <CardDescription>Серія активності</CardDescription>
              <CardTitle className="text-3xl">
                {myStreak?.current_count ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs">днів поспіль</span>
              </div>
            </CardContent>
          </Card>
        )}

        {badgesEnabled && (
          <Card>
            <CardHeader>
              <CardDescription>Нагороди</CardDescription>
              <CardTitle className="text-3xl">{myBadges.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">отримано бейджів</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {myEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Мої курси
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEnrollments.map((enrollment) => {
                const course = courseMap.get(enrollment.course_id);
                return (
                  <div key={enrollment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {course?.title ?? "Невідомий курс"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            enrollment.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {enrollment.status === "completed"
                            ? "Завершено"
                            : "В процесі"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {enrollment.completion_percent}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={enrollment.completion_percent}
                      className="h-1.5"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {badgesEnabled && myBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Мої нагороди
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {myBadges.map((badge) => (
                <Badge key={badge!.id} variant="outline" className="py-1 px-3">
                  {badge!.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeacherHome({ userId, name }: { userId: string; name: string }) {
  const { data: courses = [] } = useCourseQuery();
  const { data: enrollments = [] } = useEnrollmentQuery();
  const { data: lessons = [] } = useLessonQuery();
  const { data: lessonProgress = [] } = useLessonProgressQuery();

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacher_id === userId),
    [courses, userId],
  );

  const completionData = useMemo(() => {
    return myCourses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => e.course_id === course.id,
      );
      const avg =
        courseEnrollments.length > 0
          ? Math.round(
              courseEnrollments.reduce(
                (sum, e) => sum + e.completion_percent,
                0,
              ) / courseEnrollments.length,
            )
          : 0;
      return {
        name:
          course.title.length > 20
            ? course.title.slice(0, 20) + "…"
            : course.title,
        completion: avg,
        students: courseEnrollments.length,
      };
    });
  }, [myCourses, enrollments]);

  const completionsData = useMemo(() => {
    return myCourses.map((course) => {
      const completed = enrollments.filter(
        (e) => e.course_id === course.id && e.status === "completed",
      ).length;
      return {
        name:
          course.title.length > 20
            ? course.title.slice(0, 20) + "…"
            : course.title,
        completions: completed,
      };
    });
  }, [myCourses, enrollments]);

  const viewsData = useMemo(() => {
    return myCourses.map((course) => {
      const courseLessonIds = new Set(
        lessons.filter((l) => l.course_id === course.id).map((l) => l.id),
      );
      const views = lessonProgress.filter(
        (lp) => courseLessonIds.has(lp.lesson_id) && lp.is_viewed,
      ).length;
      return {
        name:
          course.title.length > 20
            ? course.title.slice(0, 20) + "…"
            : course.title,
        views,
      };
    });
  }, [myCourses, lessons, lessonProgress]);

  const totalStudents = new Set(
    enrollments
      .filter((e) => myCourses.some((c) => c.id === e.course_id))
      .map((e) => e.user_id),
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Вітаємо, {name}!
        </h1>
        <p className="text-muted-foreground">Статистика ваших курсів</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Ваші курси</CardDescription>
            <CardTitle className="text-3xl">{myCourses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">
                {myCourses.filter((c) => c.is_published).length} опубліковано
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Студентів записано</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs">загалом унікальних</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Загалом переглядів</CardDescription>
            <CardTitle className="text-3xl">
              {viewsData.reduce((sum, d) => sum + d.views, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-xs">переглядів уроків</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Відсоток проходження курсів
            </CardTitle>
            <CardDescription>
              Середній прогрес студентів по кожному курсу
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value) => [`${value}%`, "Проходження"]}
                  />
                  <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
                    {completionData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Немає даних для відображення
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Кількість проходжень за курсами
            </CardTitle>
            <CardDescription>
              Скільки студентів повністю завершили кожен курс
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value) => [value, "Проходжень"]}
                  />
                  <Bar dataKey="completions" radius={[6, 6, 0, 0]}>
                    {completionsData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Немає даних для відображення
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Перегляди уроків за курсами
            </CardTitle>
            <CardDescription>
              Кількість переглянутих уроків по кожному курсу
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value) => [value, "Переглядів"]}
                  />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                    {viewsData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Немає даних для відображення
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Home = () => {
  const user = useContext(CurrentUserContext);

  return (
    <div className="mx-auto max-w-6xl p-6">
      {user.role === UserRole.Admin && <AdminHome name={user.name} />}
      {user.role === UserRole.Student && (
        <StudentHome userId={user.id} name={user.name} />
      )}
      {user.role === UserRole.Teacher && (
        <TeacherHome userId={user.id} name={user.name} />
      )}
    </div>
  );
};

export default Home;

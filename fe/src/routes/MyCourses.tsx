import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  Search,
  X,
} from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { CurrentUserContext } from "../App";
import { useCourseQuery } from "../features/useCourseQuery";
import { useEnrollmentMutation } from "../features/useEnrollmentMutation";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { Course } from "../types/Course";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Enrollment } from "../types/Enrollment";

function CourseSearchDropdown({
  availableCourses,
  onEnroll,
  enrollingId,
}: {
  availableCourses: Course[];
  onEnroll: (courseId: string) => void;
  enrollingId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return availableCourses;
    const q = query.toLowerCase();
    return availableCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [availableCourses, query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Пошук нових курсів..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Курсів не знайдено
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {filtered.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {course.title}
                      </p>
                      {course.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onEnroll(course.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? "..." : "Записатися"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function findCurrentLessonId(
  courseLessons: { id: string; position: number }[],
  progressMap: Map<string, boolean>,
): string | undefined {
  const sorted = [...courseLessons].sort((a, b) => a.position - b.position);
  const first = sorted.find((l) => !progressMap.get(l.id));
  return first?.id ?? sorted[sorted.length - 1]?.id;
}

const MyCourses = () => {
  const user = useContext(CurrentUserContext);
  const { data: enrollments = [] } = useEnrollmentQuery();
  const { data: courses = [] } = useCourseQuery();
  const { data: lessons = [] } = useLessonQuery();
  const { data: lessonProgress = [] } = useLessonProgressQuery();
  const enrollMutation = useEnrollmentMutation();
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const myEnrollments = useMemo(
    () => enrollments.filter((e) => e.user_id === user.id),
    [enrollments, user.id],
  );

  const enrolledCourseIds = useMemo(
    () => new Set(myEnrollments.map((e) => e.course_id)),
    [myEnrollments],
  );

  const availableCourses = useMemo(
    () => courses.filter((c) => c.is_published && !enrolledCourseIds.has(c.id)),
    [courses, enrolledCourseIds],
  );

  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const myProgressMap = useMemo(() => {
    const map = new Map<string, boolean>();
    lessonProgress
      .filter((lp) => lp.user_id === user.id)
      .forEach((lp) => map.set(lp.lesson_id, lp.is_viewed));
    return map;
  }, [lessonProgress, user.id]);

  const handleEnroll = (courseId: string) => {
    setEnrollingId(courseId);
    enrollMutation.mutate(
      {
        type: "create",
        data: {
          user_id: user.id,
          course_id: courseId,
          status: "in_progress",
          completion_percent: 0,
        } as unknown as Enrollment,
      },
      { onSettled: () => setEnrollingId(null) },
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Мої курси</h1>
          <p className="text-muted-foreground">
            Ваші записи та пошук нових курсів
          </p>
        </div>
      </div>

      <CourseSearchDropdown
        availableCourses={availableCourses}
        onEnroll={handleEnroll}
        enrollingId={enrollingId}
      />

      {myEnrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium">Ви ще не записані на курси</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Скористайтеся пошуком вище, щоб знайти курс
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myEnrollments.map((enrollment) => {
            const course = courseMap.get(enrollment.course_id);
            if (!course) return null;

            const courseLessons = lessons
              .filter((l) => l.course_id === course.id)
              .sort((a, b) => a.position - b.position);

            const currentLessonId = findCurrentLessonId(
              courseLessons,
              myProgressMap,
            );

            const isCompleted = enrollment.status === "completed";

            return (
              <Card key={enrollment.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="leading-tight">
                      {course.title}
                    </CardTitle>
                    <Badge
                      variant={isCompleted ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Завершено
                        </>
                      ) : (
                        <>
                          <Clock className="mr-1 h-3 w-3" />В процесі
                        </>
                      )}
                    </Badge>
                  </div>
                  {course.description && (
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-end gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{courseLessons.length} уроків</span>
                      <span>{enrollment.completion_percent}%</span>
                    </div>
                    <Progress
                      value={enrollment.completion_percent}
                      className="h-1.5"
                    />
                  </div>

                  {currentLessonId && (
                    <Button asChild className="w-full" size="sm">
                      <Link
                        to={`/my-courses/${course.id}/lessons/${currentLessonId}`}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {isCompleted ? "Переглянути" : "Продовжити"}
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

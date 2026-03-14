import { useContext, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Play,
  PlayCircle,
} from "lucide-react";

import { CurrentUserContext } from "../App";
import { useCourseQuery } from "../features/useCourseQuery";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonProgressMutation } from "../features/useLessonProgressMutation";
import { Lesson } from "../types/Lesson";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";
import Loader from "../components/Loader";

const CourseLesson = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const user = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const { data: courses = [], isLoading: coursesLoading } = useCourseQuery();
  const { data: enrollments = [] } = useEnrollmentQuery();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessonQuery();
  const { data: lessonProgress = [] } = useLessonProgressQuery();
  const progressMutation = useLessonProgressMutation();

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId],
  );

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (e) => e.user_id === user.id && e.course_id === courseId,
      ),
    [enrollments, user.id, courseId],
  );

  const courseLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.course_id === courseId)
        .sort((a, b) => a.position - b.position),
    [lessons, courseId],
  );

  const currentLesson = useMemo(
    () => courseLessons.find((l) => l.id === lessonId),
    [courseLessons, lessonId],
  );

  const progressMap = useMemo(() => {
    const map = new Map<string, { is_viewed: boolean; test_score: number }>();
    lessonProgress
      .filter((lp) => lp.user_id === user.id)
      .forEach((lp) =>
        map.set(lp.lesson_id, {
          is_viewed: lp.is_viewed,
          test_score: lp.test_score,
        }),
      );
    return map;
  }, [lessonProgress, user.id]);

  const completedCount = courseLessons.filter(
    (l) => progressMap.get(l.id)?.is_viewed,
  ).length;
  const completionPercent =
    courseLessons.length > 0
      ? Math.round((completedCount / courseLessons.length) * 100)
      : 0;

  const currentLessonProgress = currentLesson
    ? progressMap.get(currentLesson.id)
    : undefined;

  const handleMarkViewed = () => {
    if (!currentLesson || currentLessonProgress?.is_viewed) return;
    progressMutation.mutate({
      type: "create",
      data: {
        id: "",
        user_id: user.id,
        lesson_id: currentLesson.id,
        is_viewed: true,
        test_score: 0,
      },
    });
  };

  const nextLesson = useMemo(() => {
    if (!currentLesson) return null;
    const idx = courseLessons.findIndex((l) => l.id === currentLesson.id);
    return idx < courseLessons.length - 1 ? courseLessons[idx + 1] : null;
  }, [courseLessons, currentLesson]);

  if (coursesLoading || lessonsLoading) return <Loader />;

  if (!course || !currentLesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Курс або урок не знайдено</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/my-courses" className="hover:text-foreground">
              Мої курси
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{course.title}</span>
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {currentLesson.title}
            </h1>
            {enrollment && (
              <Badge variant="secondary" className="mt-1">
                Урок {currentLesson.position} з {courseLessons.length}
              </Badge>
            )}
          </div>

          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-black">
              {currentLesson.video_url ? (
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={handleMarkViewed}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/50">
                  <PlayCircle className="h-16 w-16" />
                </div>
              )}
            </div>
          </Card>

          {currentLesson.transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Опис уроку
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {currentLesson.transcription}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              asChild
              variant="default"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Link
                to={`/my-courses/${courseId}/lessons/${lessonId}/test`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Пройти тест
              </Link>
            </Button>

            {nextLesson && (
              <Button
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() =>
                  navigate(
                    `/my-courses/${courseId}/lessons/${nextLesson.id}`,
                  )
                }
              >
                Наступний урок
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l bg-card lg:block">
        <div className="sticky top-0 border-b bg-card p-4">
          <CardDescription className="mb-1">Прогрес курсу</CardDescription>
          <div className="flex items-center gap-3">
            <Progress value={completionPercent} className="h-2 flex-1" />
            <span className="text-sm font-medium">{completionPercent}%</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {completedCount} з {courseLessons.length} уроків завершено
          </p>
        </div>

        <nav className="p-2">
          {courseLessons.map((lesson) => {
            const prog = progressMap.get(lesson.id);
            const isCurrent = lesson.id === lessonId;
            const isViewed = prog?.is_viewed;

            return (
              <Link
                key={lesson.id}
                to={`/my-courses/${courseId}/lessons/${lesson.id}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isCurrent
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {isViewed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : isCurrent ? (
                    <Play className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">
                    {lesson.position}. {lesson.title}
                  </span>
                  {prog?.test_score !== undefined && prog.test_score > 0 && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Тест: {prog.test_score}%
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default CourseLesson;

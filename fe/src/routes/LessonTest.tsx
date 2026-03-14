import { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  XCircle,
} from "lucide-react";

import { CurrentUserContext } from "../App";
import { useCourseQuery } from "../features/useCourseQuery";
import { useLessonQuery } from "../features/useLessonQuery";
import { useTestQuestionQuery } from "../features/useTestQuestionQuery";
import { useAnswerOptionQuery } from "../features/useAnswerOptionQuery";
import { useLessonProgressQuery } from "../features/useLessonProgressQuery";
import { useLessonProgressMutation } from "../features/useLessonProgressMutation";
import { useEnrollmentQuery } from "../features/useEnrollmentQuery";
import { useEnrollmentMutation } from "../features/useEnrollmentMutation";

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

type AnswerMap = Record<string, string>;

interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  correctOptionId: string;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
}

const LessonTest = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const user = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const { data: courses = [] } = useCourseQuery();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessonQuery();
  const { data: allQuestions = [], isLoading: questionsLoading } =
    useTestQuestionQuery();
  const { data: allOptions = [], isLoading: optionsLoading } =
    useAnswerOptionQuery();
  const { data: lessonProgress = [] } = useLessonProgressQuery();
  const { data: enrollments = [] } = useEnrollmentQuery();
  const progressMutation = useLessonProgressMutation();
  const enrollmentMutation = useEnrollmentMutation();

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [results, setResults] = useState<QuestionResult[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId],
  );

  const lesson = useMemo(
    () => lessons.find((l) => l.id === lessonId),
    [lessons, lessonId],
  );

  const courseLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.course_id === courseId)
        .sort((a, b) => a.position - b.position),
    [lessons, courseId],
  );

  const questions = useMemo(
    () =>
      allQuestions
        .filter((q) => q.lesson_id === lessonId)
        .sort((a, b) => a.id.localeCompare(b.id)),
    [allQuestions, lessonId],
  );

  const optionsByQuestion = useMemo(() => {
    const map = new Map<string, typeof allOptions>();
    questions.forEach((q) =>
      map.set(
        q.id,
        allOptions.filter((o) => o.question_id === q.id),
      ),
    );
    return map;
  }, [questions, allOptions]);

  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    const idx = courseLessons.findIndex((l) => l.id === lesson.id);
    return idx < courseLessons.length - 1 ? courseLessons[idx + 1] : null;
  }, [courseLessons, lesson]);

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (e) => e.user_id === user.id && e.course_id === courseId,
      ),
    [enrollments, user.id, courseId],
  );

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (results) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    const questionResults: QuestionResult[] = questions.map((q) => {
      const opts = optionsByQuestion.get(q.id) ?? [];
      const correctOpt = opts.find((o) => o.is_correct);
      const selectedId = answers[q.id] ?? "";
      const selectedOpt = opts.find((o) => o.id === selectedId);

      return {
        questionId: q.id,
        questionText: q.question_text,
        selectedOptionId: selectedId,
        correctOptionId: correctOpt?.id ?? "",
        selectedText: selectedOpt?.option_text ?? "Не відповіли",
        correctText: correctOpt?.option_text ?? "",
        isCorrect: selectedId === correctOpt?.id,
      };
    });

    setResults(questionResults);

    const correctCount = questionResults.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    const existingProgress = lessonProgress.find(
      (lp) => lp.user_id === user.id && lp.lesson_id === lessonId,
    );

    if (existingProgress) {
      progressMutation.mutate({
        type: "update",
        data: {
          ...existingProgress,
          test_score: score,
          is_viewed: true,
          completed_at: score === 100 ? new Date().toISOString() : undefined,
        },
      });
    } else {
      progressMutation.mutate({
        type: "create",
        data: {
          id: "",
          user_id: user.id,
          lesson_id: lessonId!,
          is_viewed: true,
          test_score: score,
          completed_at: score === 100 ? new Date().toISOString() : undefined,
        },
      });
    }

    if (score === 100 && enrollment) {
      const viewedLessons = new Set(
        lessonProgress
          .filter((lp) => lp.user_id === user.id && lp.is_viewed)
          .map((lp) => lp.lesson_id),
      );
      viewedLessons.add(lessonId!);

      const newPercent = Math.round(
        (viewedLessons.size / courseLessons.length) * 100,
      );
      const allDone = viewedLessons.size >= courseLessons.length;

      enrollmentMutation.mutate({
        type: "update",
        data: {
          ...enrollment,
          completion_percent: Math.min(newPercent, 100),
          status: allDone ? "completed" : "in_progress",
          last_activity_at: new Date().toISOString(),
        },
      });
    }
  };

  const allCorrect = results?.every((r) => r.isCorrect) ?? false;
  const answeredAll = questions.every((q) => answers[q.id]);

  if (lessonsLoading || questionsLoading || optionsLoading) return <Loader />;

  if (!course || !lesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Урок не знайдено</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-lg font-medium">Тест для цього уроку відсутній</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Поверніться до уроку або перейдіть до наступного
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" asChild>
                <Link to={`/my-courses/${courseId}/lessons/${lessonId}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  До уроку
                </Link>
              </Button>
              {nextLesson && (
                <Button asChild>
                  <Link
                    to={`/my-courses/${courseId}/lessons/${nextLesson.id}`}
                  >
                    Наступний урок
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const currentOptions = optionsByQuestion.get(currentQuestion.id) ?? [];

  if (results) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / results.length) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/my-courses" className="hover:text-foreground">
            Мої курси
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            to={`/my-courses/${courseId}/lessons/${lessonId}`}
            className="hover:text-foreground"
          >
            {lesson.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Результати тесту</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            {allCorrect ? (
              <>
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <PartyPopper className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Чудово!</CardTitle>
                <CardDescription>
                  Всі відповіді правильні. Можете переходити до наступного уроку.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <XCircle className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl">
                  {score}% правильних
                </CardTitle>
                <CardDescription>
                  {correctCount} з {results.length} правильно. Перегляньте
                  помилки нижче та спробуйте ще раз.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={score} className="h-2" />

            <div className="space-y-3">
              {results.map((r, idx) => (
                <div
                  key={r.questionId}
                  className={cn(
                    "rounded-lg border p-4",
                    r.isCorrect
                      ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {r.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {idx + 1}. {r.questionText}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ваша відповідь:{" "}
                        <span
                          className={
                            r.isCorrect
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {r.selectedText}
                        </span>
                      </p>
                      {!r.isCorrect && (
                        <p className="text-xs text-muted-foreground">
                          Правильна відповідь:{" "}
                          <span className="text-green-600 dark:text-green-400">
                            {r.correctText}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          {allCorrect && nextLesson ? (
            <Button
              size="lg"
              onClick={() =>
                navigate(
                  `/my-courses/${courseId}/lessons/${nextLesson.id}`,
                )
              }
            >
              Наступний урок
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => {
                setResults(null);
                setAnswers({});
                setCurrentIdx(0);
              }}
            >
              Спробувати ще раз
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link to={`/my-courses/${courseId}/lessons/${lessonId}`}>
              До уроку
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/my-courses" className="hover:text-foreground">
          Мої курси
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          to={`/my-courses/${courseId}/lessons/${lessonId}`}
          className="hover:text-foreground"
        >
          {lesson.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Тест</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Тест: {lesson.title}
        </h1>
        <Badge variant="secondary">
          {currentIdx + 1} / {questions.length}
        </Badge>
      </div>

      <Progress
        value={((currentIdx + 1) / questions.length) * 100}
        className="h-1.5"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {currentIdx + 1}. {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentOptions.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() =>
                  handleSelectAnswer(currentQuestion.id, option.id)
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30",
                  )}
                >
                  {String.fromCharCode(
                    65 +
                      currentOptions.findIndex((o) => o.id === option.id),
                  )}
                </span>
                {option.option_text}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Назад
        </Button>

        {currentIdx < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentIdx((i) => i + 1)}
            disabled={!answers[currentQuestion.id]}
          >
            Далі
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" disabled={!answeredAll} onClick={handleSubmit}>
            Завершити тест
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonTest;

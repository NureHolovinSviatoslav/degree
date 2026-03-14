import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./components/Home";
import Loader from "./components/Loader";
import ACLWrapper from "./components/ACLWrapper";
import { UserRole } from "./types/User";

const Profile = lazy(() => import("./routes/Profile"));

const UserSearch = lazy(() => import("./routes/UserSearch"));
const UserDetails = lazy(() => import("./routes/UserDetails"));
const UserMutate = lazy(() => import("./routes/UserMutate"));

const CourseSearch = lazy(() => import("./routes/CourseSearch"));
const CourseDetails = lazy(() => import("./routes/CourseDetails"));
const CourseMutate = lazy(() => import("./routes/CourseMutate"));

const LessonSearch = lazy(() => import("./routes/LessonSearch"));
const LessonDetails = lazy(() => import("./routes/LessonDetails"));
const LessonMutate = lazy(() => import("./routes/LessonMutate"));

const TestQuestionSearch = lazy(() => import("./routes/TestQuestionSearch"));
const TestQuestionDetails = lazy(() => import("./routes/TestQuestionDetails"));
const TestQuestionMutate = lazy(() => import("./routes/TestQuestionMutate"));

const AnswerOptionSearch = lazy(() => import("./routes/AnswerOptionSearch"));
const AnswerOptionDetails = lazy(() => import("./routes/AnswerOptionDetails"));
const AnswerOptionMutate = lazy(() => import("./routes/AnswerOptionMutate"));

const EnrollmentSearch = lazy(() => import("./routes/EnrollmentSearch"));
const EnrollmentDetails = lazy(() => import("./routes/EnrollmentDetails"));
const EnrollmentMutate = lazy(() => import("./routes/EnrollmentMutate"));

const LessonProgressSearch = lazy(
  () => import("./routes/LessonProgressSearch"),
);
const LessonProgressDetails = lazy(
  () => import("./routes/LessonProgressDetails"),
);
const LessonProgressMutate = lazy(
  () => import("./routes/LessonProgressMutate"),
);

const BadgeSearch = lazy(() => import("./routes/BadgeSearch"));
const BadgeDetails = lazy(() => import("./routes/BadgeDetails"));
const BadgeMutate = lazy(() => import("./routes/BadgeMutate"));

const UserBadgeSearch = lazy(() => import("./routes/UserBadgeSearch"));
const UserBadgeDetails = lazy(() => import("./routes/UserBadgeDetails"));
const UserBadgeMutate = lazy(() => import("./routes/UserBadgeMutate"));

const ActivityStreakSearch = lazy(
  () => import("./routes/ActivityStreakSearch"),
);
const ActivityStreakDetails = lazy(
  () => import("./routes/ActivityStreakDetails"),
);
const ActivityStreakMutate = lazy(
  () => import("./routes/ActivityStreakMutate"),
);

const GamificationSettingsSearch = lazy(
  () => import("./routes/GamificationSettingsSearch"),
);
const GamificationSettingsDetails = lazy(
  () => import("./routes/GamificationSettingsDetails"),
);
const GamificationSettingsMutate = lazy(
  () => import("./routes/GamificationSettingsMutate"),
);

const NotificationSearch = lazy(() => import("./routes/NotificationSearch"));
const NotificationDetails = lazy(() => import("./routes/NotificationDetails"));
const NotificationMutate = lazy(() => import("./routes/NotificationMutate"));

const MyCourses = lazy(() => import("./routes/MyCourses"));
const CourseLesson = lazy(() => import("./routes/CourseLesson"));
const LessonTest = lazy(() => import("./routes/LessonTest"));
const MySettings = lazy(() => import("./routes/MySettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

const adminOnly = [UserRole.Admin];
const studentOnly = [UserRole.Student];
const noAccess = <>Немає доступу</>;

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ACLWrapper allowedRoles={adminOnly} fallback={noAccess}>
      {children}
    </ACLWrapper>
  );
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ACLWrapper allowedRoles={studentOnly} fallback={noAccess}>
      {children}
    </ACLWrapper>
  );
}

const Router = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="my-courses"
                element={
                  <StudentRoute>
                    <MyCourses />
                  </StudentRoute>
                }
              />
              <Route
                path="my-courses/:courseId/lessons/:lessonId"
                element={
                  <StudentRoute>
                    <CourseLesson />
                  </StudentRoute>
                }
              />
              <Route
                path="my-courses/:courseId/lessons/:lessonId/test"
                element={
                  <StudentRoute>
                    <LessonTest />
                  </StudentRoute>
                }
              />
              <Route
                path="my-settings"
                element={
                  <StudentRoute>
                    <MySettings />
                  </StudentRoute>
                }
              />

              <Route
                path="users"
                element={
                  <AdminRoute>
                    <UserSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="users/:id"
                element={
                  <AdminRoute>
                    <UserDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="users/create"
                element={
                  <AdminRoute>
                    <UserMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="users/update/:id"
                element={
                  <AdminRoute>
                    <UserMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="courses"
                element={
                  <AdminRoute>
                    <CourseSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="courses/:id"
                element={
                  <AdminRoute>
                    <CourseDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="courses/create"
                element={
                  <AdminRoute>
                    <CourseMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="courses/update/:id"
                element={
                  <AdminRoute>
                    <CourseMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="lessons"
                element={
                  <AdminRoute>
                    <LessonSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="lessons/:id"
                element={
                  <AdminRoute>
                    <LessonDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="lessons/create"
                element={
                  <AdminRoute>
                    <LessonMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="lessons/update/:id"
                element={
                  <AdminRoute>
                    <LessonMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="test-questions"
                element={
                  <AdminRoute>
                    <TestQuestionSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="test-questions/:id"
                element={
                  <AdminRoute>
                    <TestQuestionDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="test-questions/create"
                element={
                  <AdminRoute>
                    <TestQuestionMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="test-questions/update/:id"
                element={
                  <AdminRoute>
                    <TestQuestionMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="answer-options"
                element={
                  <AdminRoute>
                    <AnswerOptionSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="answer-options/:id"
                element={
                  <AdminRoute>
                    <AnswerOptionDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="answer-options/create"
                element={
                  <AdminRoute>
                    <AnswerOptionMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="answer-options/update/:id"
                element={
                  <AdminRoute>
                    <AnswerOptionMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="enrollments"
                element={
                  <AdminRoute>
                    <EnrollmentSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="enrollments/:id"
                element={
                  <AdminRoute>
                    <EnrollmentDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="enrollments/create"
                element={
                  <AdminRoute>
                    <EnrollmentMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="enrollments/update/:id"
                element={
                  <AdminRoute>
                    <EnrollmentMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="lesson-progress"
                element={
                  <AdminRoute>
                    <LessonProgressSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="lesson-progress/:id"
                element={
                  <AdminRoute>
                    <LessonProgressDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="lesson-progress/create"
                element={
                  <AdminRoute>
                    <LessonProgressMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="lesson-progress/update/:id"
                element={
                  <AdminRoute>
                    <LessonProgressMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="badges"
                element={
                  <AdminRoute>
                    <BadgeSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="badges/:id"
                element={
                  <AdminRoute>
                    <BadgeDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="badges/create"
                element={
                  <AdminRoute>
                    <BadgeMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="badges/update/:id"
                element={
                  <AdminRoute>
                    <BadgeMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="user-badges"
                element={
                  <AdminRoute>
                    <UserBadgeSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="user-badges/:id"
                element={
                  <AdminRoute>
                    <UserBadgeDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="user-badges/create"
                element={
                  <AdminRoute>
                    <UserBadgeMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="user-badges/update/:id"
                element={
                  <AdminRoute>
                    <UserBadgeMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="activity-streaks"
                element={
                  <AdminRoute>
                    <ActivityStreakSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="activity-streaks/:id"
                element={
                  <AdminRoute>
                    <ActivityStreakDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="activity-streaks/create"
                element={
                  <AdminRoute>
                    <ActivityStreakMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="activity-streaks/update/:id"
                element={
                  <AdminRoute>
                    <ActivityStreakMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="gamification-settings"
                element={
                  <AdminRoute>
                    <GamificationSettingsSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="gamification-settings/:id"
                element={
                  <AdminRoute>
                    <GamificationSettingsDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="gamification-settings/create"
                element={
                  <AdminRoute>
                    <GamificationSettingsMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="gamification-settings/update/:id"
                element={
                  <AdminRoute>
                    <GamificationSettingsMutate />
                  </AdminRoute>
                }
              />

              <Route
                path="notifications"
                element={
                  <AdminRoute>
                    <NotificationSearch />
                  </AdminRoute>
                }
              />
              <Route
                path="notifications/:id"
                element={
                  <AdminRoute>
                    <NotificationDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="notifications/create"
                element={
                  <AdminRoute>
                    <NotificationMutate />
                  </AdminRoute>
                }
              />
              <Route
                path="notifications/update/:id"
                element={
                  <AdminRoute>
                    <NotificationMutate />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<>Сторінку не знайдено</>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default Router;

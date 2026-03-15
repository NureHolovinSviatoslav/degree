import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  HelpCircle,
  ListChecks,
  ClipboardList,
  BarChart3,
  Award,
  Trophy,
  Flame,
  Settings,
  Bell,
} from "lucide-react";

import { CurrentUserContext } from "../App";
import { UserRole } from "../types/User";
import { cn } from "../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Головна", roles: null },
  {
    to: "/my-courses",
    icon: BookOpen,
    label: "Мої курси",
    roles: [UserRole.Student],
  },
  {
    to: "/my-settings",
    icon: Settings,
    label: "Налаштування",
    roles: [UserRole.Student],
  },
  { to: "/users", icon: Users, label: "Користувачі", roles: [UserRole.Admin] },
  { to: "/courses", icon: BookOpen, label: "Курси", roles: [UserRole.Admin] },
  {
    to: "/lessons",
    icon: GraduationCap,
    label: "Уроки",
    roles: [UserRole.Admin],
  },
  {
    to: "/test-questions",
    icon: HelpCircle,
    label: "Тестові питання",
    roles: [UserRole.Admin],
  },
  {
    to: "/answer-options",
    icon: ListChecks,
    label: "Варіанти відповідей",
    roles: [UserRole.Admin],
  },
  {
    to: "/enrollments",
    icon: ClipboardList,
    label: "Записи на курси",
    roles: [UserRole.Admin],
  },
  {
    to: "/lesson-progress",
    icon: BarChart3,
    label: "Прогрес уроків",
    roles: [UserRole.Admin],
  },
  { to: "/badges", icon: Award, label: "Бейджі", roles: [UserRole.Admin] },
  {
    to: "/user-badges",
    icon: Trophy,
    label: "Бейджі користувачів",
    roles: [UserRole.Admin],
  },
  {
    to: "/activity-streaks",
    icon: Flame,
    label: "Серії активності",
    roles: [UserRole.Admin],
  },
  {
    to: "/gamification-settings",
    icon: Settings,
    label: "Налаштування гейміфікації",
    roles: [UserRole.Admin],
  },
  {
    to: "/notifications",
    icon: Bell,
    label: "Сповіщення",
    roles: [UserRole.Admin],
  },
] as const;

export const Nav = () => {
  const user = useContext(CurrentUserContext);
  const location = useLocation();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.roles === null ||
      (user.role && (item.roles as readonly UserRole[]).includes(user.role)),
  );

  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r bg-card py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/profile">
            <Avatar className="h-9 w-9 cursor-pointer transition-opacity hover:opacity-80">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Профіль</TooltipContent>
      </Tooltip>

      <Separator className="my-3 w-8" />

      <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const active =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <Link
                  to={to}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};

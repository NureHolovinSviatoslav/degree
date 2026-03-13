export type Badge = {
  id: string;
  name: string;
  description?: string;
  condition_type: "course_completion" | "activity_streak";
};

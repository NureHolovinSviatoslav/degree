export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: "in_progress" | "completed";
  completion_percent: number;
  last_activity_at?: string;
};

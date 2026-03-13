export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  is_viewed: boolean;
  test_score: number;
  completed_at?: string;
};

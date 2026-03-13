export type Course = {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  is_published: boolean;
  created_at?: string;
};

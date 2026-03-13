export enum UserRole {
  Admin = "admin",
  Teacher = "teacher",
  Student = "student",
}

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | null;
  phone?: string;
  created_at?: string;
};

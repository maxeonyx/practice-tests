import type { CourseId } from "../content/curriculum";
export interface StudyAttempt {
  id: string;
  questionId: string;
  courseId: CourseId;
  answeredAt: string;
  answer: string;
  result: "knew" | "partly" | "missed";
}
export interface ReviewState {
  questionId: string;
  due: string;
  lapses: number;
  scheduler: { name: "fsrs"; version: string; data: Record<string, number> };
}
export interface Preferences {
  schemaVersion: 1;
  availableMinutes: 5 | 20 | 60 | null;
}
export const initialPreferences: Preferences = {
  schemaVersion: 1,
  availableMinutes: null,
};

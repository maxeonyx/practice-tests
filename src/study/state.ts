import type { Card } from "ts-fsrs";
import type { CourseId } from "../content/curriculum";
export type AnswerRating = "again" | "hard" | "good" | "easy";
export interface StudyAttempt {
  id: string;
  questionId: string;
  courseId: CourseId;
  answeredAt: string;
  answer: string;
  rating: AnswerRating;
  independent: boolean;
}
export interface ReviewState {
  questionId: string;
  card: Card;
  scheduler: "FSRS-6";
}
export interface Preferences {
  schemaVersion: 1;
  availableMinutes: 5 | 20 | 60 | null;
}
export const initialPreferences: Preferences = {
  schemaVersion: 1,
  availableMinutes: null,
};
export interface Session {
  rootId: string;
  questionId: string;
  phase: "answer" | "feedback" | "complete";
  claim: "known" | "unknown" | null;
  answer: string;
  parts: string[];
  partIndex: number;
  assisted: boolean;
  seenIds: string[];
  decomposedIds: string[];
  frames: { parentId: string; childIds: string[]; remainingIds: string[] }[];
  startedAt: string;
  completedRating?: AnswerRating;
}
export interface LearnerState {
  preferences: Preferences;
  attempts: StudyAttempt[];
  reviews: ReviewState[];
  session: Session | null;
  revision: number;
}
export function startSession(questionId: string, now = new Date()): Session {
  return {
    rootId: questionId,
    questionId,
    phase: "answer",
    claim: null,
    answer: "",
    parts: [],
    partIndex: 0,
    assisted: false,
    seenIds: [],
    decomposedIds: [],
    frames: [],
    startedAt: now.toISOString(),
  };
}

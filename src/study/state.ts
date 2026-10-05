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
  rootId?: string;
  sessionStartedAt?: string;
}
export interface ReviewState {
  questionId: string;
  card: Card;
  scheduler: "FSRS-6";
}
export interface Preferences {
  schemaVersion: 1;
  availableMinutes: 5 | 10 | 20 | 60 | null;
  firstOpenedAt?: string;
  lastOpenedRootId?: string;
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
  seenIds: string[];
  cuedIds?: string[];
  decomposedIds: string[];
  frames: { parentId: string; childIds: string[]; remainingIds: string[] }[];
  startedAt: string;
  lastActiveAt?: string;
  completedRating?: AnswerRating;
  selectedChoice?: number;
  recalledIds?: string[];
  openResponses?: Record<
    string,
    { stage: "preview" | "supports" | "write" | "model"; draft: string }
  >;
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
    seenIds: [],
    decomposedIds: [],
    frames: [],
    startedAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
  };
}

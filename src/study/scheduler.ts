import { fsrs, createEmptyCard, Rating } from "ts-fsrs";
import {
  assessments,
  questions,
  concepts,
  type Question,
} from "../content/curriculum";
import type {
  AnswerRating,
  LearnerState,
  ReviewState,
  StudyAttempt,
} from "./state";
const memory = fsrs({ request_retention: 0.9, enable_fuzz: false });
const ratings = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const;
export function scheduleReview(
  id: string,
  rating: AnswerRating,
  previous: ReviewState | undefined,
  now: Date,
): ReviewState {
  return {
    questionId: id,
    card: memory.next(
      previous?.card ?? createEmptyCard(now),
      now,
      ratings[rating],
    ).card,
    scheduler: "FSRS-6",
  };
}
export function independentEvidence(
  attempts: StudyAttempt[],
  id: string,
): StudyAttempt | undefined {
  return attempts
    .filter((a) => a.questionId === id && a.independent)
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))[0];
}
export interface Recommendation {
  question: Question;
  reason: string;
}
export function recommend(
  state: LearnerState,
  now = new Date(),
): Recommendation | undefined {
  const active = assessments.filter(
    (a) => new Date(a.date).getTime() > now.getTime(),
  );
  const reviews = new Map(state.reviews.map((r) => [r.questionId, r]));
  const latest = [...state.attempts]
    .filter((a) =>
      questions.some((q) => q.id === a.questionId && q.kind === "constructed"),
    )
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt));
  const recent = latest.slice(0, 3);
  const neglected =
    recent.length === 3 &&
    recent.every((a) => a.courseId === recent[0].courseId)
      ? active.find((a) => a.courseId !== recent[0].courseId)?.courseId
      : undefined;
  const ranked = questions.flatMap((q) => {
    const exam = active.find((a) => a.courseId === q.courseId);
    if (exam === undefined) return [];
    const review = reviews.get(q.id);
    const due =
      review !== undefined && review.card.due.getTime() <= now.getTime();
    if (q.kind === "recall" && !due) return [];
    if (review !== undefined && !due) return [];
    const days = Math.max(
      1,
      (new Date(exam.date).getTime() - now.getTime()) / 86400000,
    );
    const last = independentEvidence(state.attempts, q.id);
    const recall =
      review === undefined
        ? 0
        : memory.get_retrievability(review.card, now, false);
    const connections = concepts.filter((c) =>
      c.prerequisiteIds.some((id) => q.conceptIds.includes(id)),
    ).length;
    const need =
      review === undefined
        ? 1
        : 1.4 + (1 - recall) + (last?.rating === "again" ? 0.5 : 0);
    const short =
      state.preferences.availableMinutes === 5
        ? Math.min(1, 240 / q.estimatedSeconds)
        : 1;
    const score =
      (exam.weight / Math.sqrt(days)) *
      need *
      (1 + Math.min(connections, 5) * 0.08) *
      q.importance *
      short;
    const reason = due
      ? "A spaced review is due. Reconstruct it before checking the guide."
      : "Build an untested area before your assessment.";
    return [{ question: q, reason, score }];
  });
  const balanced =
    neglected === undefined
      ? ranked
      : ranked.filter((r) => r.question.courseId === neglected);
  return (balanced.length > 0 ? balanced : ranked).sort(
    (a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id),
  )[0];
}

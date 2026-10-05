import { fsrs, createEmptyCard, Rating } from "ts-fsrs";
import {
  assessments,
  questions,
  question,
  questionById,
  studyRootIds,
  studyQuestionIds,
  type CourseId,
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
  options: { fresh?: boolean } = {},
): Recommendation | undefined {
  const active = assessments.filter(
    (a) => new Date(a.date).getTime() > now.getTime(),
  );
  const roots = new Set(studyRootIds);
  const reviews = new Map(state.reviews.map((r) => [r.questionId, r]));
  const attempts = [...state.attempts].sort((a, b) =>
    b.answeredAt.localeCompare(a.answeredAt),
  );
  // A prerequisite sequence is one piece of course work, including missed answers.
  const work = new Map<string, StudyAttempt>();
  for (const attempt of attempts) {
    if (!questionById.has(attempt.rootId ?? attempt.questionId)) continue;
    const key =
      attempt.rootId !== undefined && attempt.sessionStartedAt !== undefined
        ? `${attempt.sessionStartedAt}:${attempt.rootId}`
        : attempt.id;
    if (!work.has(key)) work.set(key, attempt);
  }
  const workItems = [...work.values()];
  const rootExposure = new Map<string, number>();
  const unitExposure = new Map<string, number>();
  const courseWork = new Map<CourseId, number>();
  for (const attempt of workItems) {
    const rootId = attempt.rootId ?? attempt.questionId;
    const unitId = question(rootId).unitId;
    rootExposure.set(rootId, (rootExposure.get(rootId) ?? 0) + 1);
    unitExposure.set(unitId, (unitExposure.get(unitId) ?? 0) + 1);
  }
  for (const attempt of workItems.slice(0, 12))
    courseWork.set(
      attempt.courseId,
      (courseWork.get(attempt.courseId) ?? 0) + 1,
    );
  const coursePriority = (courseId: CourseId) => {
    const exam = active.find((a) => a.courseId === courseId)!;
    const days = Math.max(
      1,
      (Date.parse(exam.date) - now.getTime()) / 86400000,
    );
    return (
      exam.weight / Math.sqrt(days) / (2 + (courseWork.get(courseId) ?? 0))
    );
  };
  const recent = workItems.slice(0, 3);
  const neglected =
    recent.length === 3 &&
    recent.every((a) => a.courseId === recent[0].courseId)
      ? active.find((a) => a.courseId !== recent[0].courseId)?.courseId
      : undefined;
  const initialCare =
    state.preferences.firstOpenedAt === undefined ||
    now.getTime() - Date.parse(state.preferences.firstOpenedAt) < 3 * 86400000;
  let candidates = (
    options.fresh === true ? studyRootIds.map(question) : questions
  )
    .filter((q) => studyQuestionIds.has(q.id))
    .filter((q) => active.some((a) => a.courseId === q.courseId))
    .filter(
      (q) =>
        q.interaction?.type !== "open-answer" ||
        state.preferences.availableMinutes === null ||
        state.preferences.availableMinutes >= 20,
    )
    .filter((q) => {
      if (options.fresh === true) return true;
      const review = reviews.get(q.id);
      if (review !== undefined)
        return review.card.due.getTime() <= now.getTime();
      return roots.has(q.id);
    });
  const previousRoot =
    state.session?.rootId ?? state.preferences.lastOpenedRootId;
  candidates = candidates.filter((q) => q.id !== previousRoot);
  const preferredCourse: CourseId | undefined =
    options.fresh === true &&
    initialCare &&
    candidates.some((q) => q.courseId === "integrated-care")
      ? "integrated-care"
      : neglected;
  if (
    preferredCourse !== undefined &&
    candidates.some((q) => q.courseId === preferredCourse)
  )
    candidates = candidates.filter((q) => q.courseId === preferredCourse);
  if (options.fresh === true) {
    const first = studyRootIds.find((id) =>
      candidates.some((q) => q.id === id),
    );
    if (attempts.length === 0 && first !== undefined)
      return {
        question: question(first),
        reason: "Start with an exam-relevant question.",
      };
    const exposure = (q: Question) => rootExposure.get(q.id) ?? 0;
    candidates.sort(
      (a, b) =>
        exposure(a) - exposure(b) ||
        coursePriority(b.courseId) - coursePriority(a.courseId) ||
        a.estimatedSeconds - b.estimatedSeconds ||
        studyRootIds.indexOf(a.id) - studyRootIds.indexOf(b.id),
    );
    const next = candidates[0];
    return next === undefined
      ? undefined
      : {
          question: next,
          reason: "Start with a varied exam-relevant question.",
        };
  }
  const ranked = candidates.map((q) => {
    const review = reviews.get(q.id);
    const last = independentEvidence(state.attempts, q.id);
    const recall =
      review === undefined
        ? 0
        : memory.get_retrievability(review.card, now, false);
    const unitWork = unitExposure.get(q.unitId) ?? 0;
    const need =
      review === undefined
        ? 1.5
        : 1.4 + (1 - recall) + (last?.rating === "again" ? 0.3 : 0);
    const recentRepeats = attempts.filter(
      (a) =>
        a.questionId === q.id &&
        now.getTime() - Date.parse(a.answeredAt) < 3 * 3600000,
    ).length;
    const breadth =
      roots.has(q.id) && review === undefined ? 1 + 3 / (1 + unitWork) : 1;
    const short =
      state.preferences.availableMinutes !== null &&
      state.preferences.availableMinutes <= 10
        ? Math.min(
            1,
            (state.preferences.availableMinutes * 60) / q.estimatedSeconds,
          )
        : 1;
    const score =
      (coursePriority(q.courseId) * q.importance * need * breadth * short) /
      (1 + recentRepeats);
    return {
      question: q,
      reason:
        review === undefined
          ? "Build an untested area before your assessment."
          : "A spaced review is due.",
      score,
    };
  });
  return ranked.sort(
    (a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id),
  )[0];
}

import { test, expect } from "@playwright/test";
import {
  questions,
  question,
  concepts,
  clusters,
  sources,
  assessments,
  units,
  studyRootIds,
} from "../src/content/curriculum";
import { recommend, scheduleReview } from "../src/study/scheduler";
import {
  initialPreferences,
  startSession,
  type LearnerState,
} from "../src/study/state";
const now = new Date("2026-10-04T12:00:00+13:00");
const empty = (): LearnerState => ({
  preferences: { ...initialPreferences },
  attempts: [],
  reviews: [],
  session: null,
  revision: 0,
});

test("memory reviews distinguish failure from easy recall and exclude questions not due", () => {
  const easy = scheduleReview("adme", "easy", undefined, now);
  const missed = scheduleReview("adme", "again", undefined, now);
  expect(easy.card.due.getTime()).toBeGreaterThan(missed.card.due.getTime());
  expect(missed.card.due.getTime()).toBeGreaterThan(now.getTime());
  const state = empty();
  state.reviews = [easy];
  expect(recommend(state, now)?.question.id).not.toBe("adme");
});
test("allocation prevents neglect and shifts to Pharmacology after Integrated Care", () => {
  const state = empty();
  const roots = questions
    .filter((q) => q.courseId === "integrated-care" && q.kind === "constructed")
    .slice(0, 3);
  state.attempts = roots.map((q, i) => ({
    id: String(i),
    questionId: q.id,
    courseId: q.courseId,
    answeredAt: new Date(now.getTime() - i * 1000).toISOString(),
    answer: "recalled",
    rating: "good",
    independent: true,
  }));
  expect(recommend(state, now)?.question.courseId).toBe("pharmacology");
  expect(
    recommend(empty(), new Date("2026-10-28T12:00:00+13:00"))?.question
      .courseId,
  ).toBe("integrated-care");
  expect(
    recommend(empty(), new Date("2026-10-30T12:00:00+13:00"))?.question
      .courseId,
  ).toBe("pharmacology");
  expect(
    recommend(empty(), new Date("2026-11-03T00:00:00+13:00")),
  ).toBeUndefined();
});
test("a due prerequisite can be recommended as independent spaced recall", () => {
  const state = empty();
  const future = new Date(now.getTime() + 86400000 * 20);
  state.reviews = questions
    .filter((q) => studyRootIds.includes(q.id))
    .map((q) => scheduleReview(q.id, "easy", undefined, future));
  const support = studyRootIds
    .map(question)
    .flatMap((q) => q.prerequisiteQuestionIds)[0];
  state.reviews.push(
    scheduleReview(
      support,
      "again",
      undefined,
      new Date(now.getTime() - 3600000),
    ),
  );
  expect(recommend(state, now)?.question.id).toBe(support);
});
test("published curriculum has complete links, source traces, and acyclic prerequisites", () => {
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  expect(new Set(concepts.map((c) => c.id)).size).toBe(concepts.length);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    expect(visiting.has(id), `Prerequisite cycle at ${id}`).toBe(false);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of question(id).prerequisiteQuestionIds) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const q of questions) {
    expect(q.rubric.length, q.id).toBeGreaterThan(0);
    expect(q.sources.length, q.id).toBeGreaterThan(0);
    expect(
      units.some((u) => u.id === q.unitId && u.courseId === q.courseId),
      q.id,
    ).toBe(true);
    expect(
      clusters.some((c) => c.id === q.clusterId),
      q.id,
    ).toBe(true);
    for (const id of q.conceptIds)
      expect(
        concepts.some((c) => c.id === id),
        q.id,
      ).toBe(true);
    for (const r of q.sources) {
      expect(
        sources.some((s) => s.id === r.sourceId),
        q.id,
      ).toBe(true);
      if (typeof r.page === "number") expect(r.page, q.id).toBeGreaterThan(0);
      else if (typeof r.page === "string")
        expect(r.page.length, q.id).toBeGreaterThan(0);
      else {
        const source = sources.find((s) => s.id === r.sourceId)!;
        expect(source.kind, q.id).toContain("web");
        expect(source.url, q.id).toMatch(/^https:\/\//);
      }
      expect(r.excerpt.length, q.id).toBeGreaterThan(0);
    }
    visit(q.id);
  }
  for (const c of clusters)
    for (const n of c.diagram?.nodes ?? [])
      expect(question(n.conceptId).clusterId).toBe(c.id);
  for (const u of units)
    expect(
      questions.some((q) => q.unitId === u.id && q.kind === "constructed"),
      u.id,
    ).toBe(true);
  expect(assessments.find((a) => a.id === "a5")?.weight).toBe(40);
  expect(assessments.find((a) => a.id === "pharm-final")?.weight).toBe(50);
  expect(
    questions.filter((q) => q.origin !== undefined).length,
  ).toBeGreaterThanOrEqual(3);
});

test("independent due recall sessions count toward course balance", () => {
  const state = empty();
  const recall = questions
    .filter((q) => q.courseId === "integrated-care" && q.kind === "recall")
    .slice(0, 3);
  state.attempts = recall.map((q, i) => ({
    id: String(i),
    questionId: q.id,
    courseId: q.courseId,
    answeredAt: new Date(now.getTime() - i * 1000).toISOString(),
    answer: "recalled",
    rating: "good",
    independent: true,
  }));
  expect(
    recommend(state, new Date("2026-10-28T12:00:00+13:00"))?.question.courseId,
  ).toBe("pharmacology");
});

test("fresh openings favour Integrated Care and vary after repeated misses", () => {
  const state = empty();
  state.preferences.firstOpenedAt = now.toISOString();
  const seen = new Set<string>();
  const careRoots = studyRootIds.filter(
    (id) => question(id).courseId === "integrated-care",
  );
  for (let i = 0; i < careRoots.length; i++) {
    const next = recommend(state, now, { fresh: true })?.question;
    expect(next).toBeDefined();
    expect(next!.courseId).toBe("integrated-care");
    expect(seen.has(next!.id)).toBe(false);
    seen.add(next!.id);
    state.session = startSession(next!.id, now);
    state.attempts.push({
      id: String(i),
      questionId: next!.id,
      rootId: next!.id,
      sessionStartedAt: new Date(now.getTime() + i * 1000).toISOString(),
      courseId: next!.courseId,
      answeredAt: now.toISOString(),
      answer: "",
      rating: "again",
      independent: true,
    });
    state.reviews.push(scheduleReview(next!.id, "again", undefined, now));
  }
  expect(seen.size).toBe(careRoots.length);
  expect(recommend(state, now, { fresh: true })?.question.id).not.toBe(
    state.session?.rootId,
  );
});

test("assisted prerequisite work counts once per root toward cross-course allocation", () => {
  const state = empty();
  const roots = studyRootIds
    .filter((id) => question(id).courseId === "integrated-care")
    .slice(0, 3);
  state.attempts = roots.flatMap((id, i) =>
    [0, 1, 2].map((step) => ({
      id: `${i}-${step}`,
      questionId: id,
      rootId: id,
      sessionStartedAt: new Date(now.getTime() - i * 1000).toISOString(),
      courseId: question(id).courseId,
      answeredAt: now.toISOString(),
      answer: "",
      rating: "again" as const,
      independent: false,
    })),
  );
  expect(recommend(state, now)?.question.courseId).toBe("pharmacology");
  state.attempts = state.attempts.filter((a) => a.rootId === roots[0]);
  expect(
    recommend(state, new Date("2026-10-28T12:00:00+13:00"))?.question.courseId,
  ).toBe("integrated-care");
});

test("continuation covers new roots without immediately repeating a completed root", () => {
  const state = empty();
  const first = recommend(state, now, { fresh: true })!.question;
  state.session = { ...startSession(first.id, now), phase: "complete" };
  state.reviews = [
    scheduleReview(
      first.id,
      "again",
      undefined,
      new Date(now.getTime() - 3600000),
    ),
  ];
  const next = recommend(state, now)?.question;
  expect(next!.id).not.toBe(first.id);
  expect(studyRootIds).toContain(next!.id);
  expect(question(next!.id).unitId).not.toBe(first.unitId);
});

test("fresh openings after the first exam contain Pharmacology full questions only", () => {
  const next = recommend(empty(), new Date("2026-10-30T12:00:00+13:00"), {
    fresh: true,
  })!.question;
  expect(next.courseId).toBe("pharmacology");
  expect(studyRootIds).toContain(next.id);
});

test("removed questions remain in saved history without preventing new revision", () => {
  const state = empty();
  state.attempts = [
    {
      id: "old",
      questionId: "removed-catalogue-question",
      courseId: "pharmacology",
      answeredAt: now.toISOString(),
      rating: "again",
      independent: true,
      answer: "",
    },
  ];
  state.reviews = [
    scheduleReview(
      "removed-catalogue-question",
      "again",
      undefined,
      new Date(now.getTime() - 3600000),
    ),
  ];
  expect(recommend(state, now)?.question.id).not.toBe(
    "removed-catalogue-question",
  );
  expect(state.reviews[0].questionId).toBe("removed-catalogue-question");
});

test("a fresh opening varies even when the previous question was not rated", () => {
  const state = empty();
  state.preferences.lastOpenedRootId = studyRootIds[0];
  expect(recommend(state, now, { fresh: true })?.question.id).not.toBe(
    studyRootIds[0],
  );
});

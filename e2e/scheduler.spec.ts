import { test, expect } from "@playwright/test";
import {
  questions,
  question,
  concepts,
  clusters,
  sources,
  assessments,
  units,
} from "../src/content/curriculum";
import { recommend, scheduleReview } from "../src/study/scheduler";
import { initialPreferences, type LearnerState } from "../src/study/state";
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
    .filter((q) => q.kind === "constructed")
    .map((q) => scheduleReview(q.id, "easy", undefined, future));
  state.reviews.push(
    scheduleReview(
      "adme-metabolism",
      "again",
      undefined,
      new Date(now.getTime() - 3600000),
    ),
  );
  expect(recommend(state, now)?.question.id).toBe("adme-metabolism");
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
      expect(r.page, q.id).toBeGreaterThan(0);
      expect(r.excerpt.length, q.id).toBeGreaterThan(0);
    }
    visit(q.id);
  }
  for (const c of clusters)
    for (const n of c.diagram.nodes)
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

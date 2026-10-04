import "./style.css";
import { knowledgeShape, controlIcon } from "./ui/visuals";
import { registerSW } from "virtual:pwa-register";
import {
  assessments,
  question,
  questionById,
  studyRootIds,
  sourceById,
  type Question,
} from "./content/curriculum";
import { loadState, persist } from "./persistence/database";
import {
  startSession,
  type LearnerState,
  type Session,
  type AnswerRating,
  type StudyAttempt,
} from "./study/state";
import { recommend, scheduleReview } from "./study/scheduler";

const app = document.querySelector<HTMLDivElement>("#app")!;
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
app.innerHTML = `<main id="main"><div id="error" role="alert" hidden></div><div id="view"></div></main><dialog id="information"><button class="icon-button close" data-action="close" aria-label="Close">${controlIcon("close")}</button><div id="dialog-content"></div></dialog>`;
const view = document.querySelector<HTMLElement>("#view")!;
const dialog = document.querySelector<HTMLDialogElement>("#information")!;
const dialogContent = document.querySelector<HTMLElement>("#dialog-content")!;
let state: LearnerState;
let busy = false;
let failed = false;
let pending = 0;
let queue: Promise<void> = Promise.resolve();
let updateAvailable = false;

function storageError(error: unknown) {
  console.error("Could not open or save revision progress", error);
  failed = true;
  const banner = document.querySelector<HTMLElement>("#error")!;
  banner.hidden = false;
  banner.textContent = `Progress could not be saved. Keep this page open. ${error instanceof Error ? error.message : "Browser storage is unavailable. Check browser storage settings, then reload."}`;
  for (const button of view.querySelectorAll<HTMLButtonElement>("button"))
    button.disabled = true;
}
window.addEventListener("storage-blocked", () =>
  storageError(
    new Error("Close other Kibra tabs, then reload to open saved progress."),
  ),
);
window.addEventListener("beforeunload", (event) => {
  if (pending > 0) event.preventDefault();
});
function enqueue(action: () => Promise<void>) {
  pending++;
  queue = queue
    .then(async () => {
      if (!failed) await action();
    })
    .catch(storageError)
    .finally(() => {
      pending--;
      busy = false;
    });
}
async function save(change: Parameters<typeof persist>[1]) {
  const revision = await persist(state, change);
  if ("session" in change) state.session = change.session ?? null;
  if (change.preferences !== undefined) state.preferences = change.preferences;
  if (change.attempt !== undefined) state.attempts.push(change.attempt);
  if (change.review !== undefined)
    state.reviews = [
      ...state.reviews.filter(
        (r) => r.questionId !== change.review!.questionId,
      ),
      change.review,
    ];
  state.revision = revision;
}
const localDay = (value: string) =>
  new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
function canResume(session: Session | null): session is Session {
  if (
    session === null ||
    session.phase === "complete" ||
    !questionById.has(session.rootId) ||
    !studyRootIds.includes(session.rootId)
  )
    return false;
  const lastActive = session.lastActiveAt ?? session.startedAt;
  const now = new Date();
  return (
    now.getTime() - new Date(lastActive).getTime() < 3 * 60 * 60 * 1000 &&
    localDay(lastActive) === localDay(now.toISOString()) &&
    assessments.some(
      (a) =>
        a.courseId === question(session.rootId).courseId &&
        new Date(a.date) > now,
    )
  );
}
function home() {
  document.body.dataset.course = "home";
  document.querySelector("main")!.setAttribute("data-course", "home");
  view.innerHTML = `<section class="home"><span class="home-mark" aria-hidden="true">k</span><h1>How much time do you have?</h1><div class="time-options" role="group" aria-label="Available study time">${[
    [5, "5 min"],
    [10, "10 min"],
    [20, "20 min"],
    [60, "An hour"],
    [null, "Just study"],
  ]
    .map(
      ([minutes, label]) =>
        `<button data-minutes="${minutes}">${label}</button>`,
    )
    .join(
      "",
    )}</div><div class="home-tools"><button class="text-button" data-action="install">Install app</button>${updateAvailable ? '<button class="text-button" data-action="update">Update app</button>' : ""}</div></section>`;
}
function learningVisual(q: Question, revealed: boolean) {
  const visual = q.visual;
  if (
    visual === undefined ||
    (visual.showOn === "answer" && !revealed) ||
    (visual.showOn === "question" && revealed)
  )
    return "";
  return `<figure class="learning-visual"><img src="${escape(visual.src)}" alt="${escape(visual.alt)}" decoding="async"></figure>`;
}
function study() {
  const s = state.session!;
  const q = question(s.questionId);
  const revealed = s.phase === "feedback";
  document.body.dataset.course = q.courseId;
  const main = document.querySelector("main")!;
  const previousId =
    main.getAttribute("data-root-id") === s.rootId
      ? (main.getAttribute("data-question-id") ?? undefined)
      : undefined;
  main.setAttribute("data-course", q.courseId);
  main.setAttribute("data-question-id", q.id);
  main.setAttribute("data-root-id", s.rootId);
  const controls = !revealed
    ? `<button class="secondary" data-action="unknown">I don’t know it</button><button class="primary" data-action="known">I know it</button>`
    : s.claim === "unknown"
      ? '<button class="primary next" data-action="continue">Next <span aria-hidden="true">→</span></button>'
      : `<button class="wrong" data-rating="again">I was wrong</button><div class="ratings"><button data-rating="hard">Hard</button><button data-rating="good">Medium</button><button data-rating="easy">Easy</button></div>`;
  view.innerHTML = `<section class="study ${revealed ? "revealed" : ""}"><div class="study-tools"><button class="icon-button" data-action="home" aria-label="Home">${controlIcon("home")}</button>${knowledgeShape(s.rootId, s.questionId, previousId)}<button class="icon-button" data-action="information" aria-label="Question information">${controlIcon("info")}</button></div><article class="card"><h1 id="question-prompt" class="question-prompt">${escape(q.prompt)}</h1>${learningVisual(q, revealed)}${revealed ? `<div id="question-answer" class="answer" tabindex="-1">${q.rubric.map((line) => `<p>${escape(line)}</p>`).join("")}</div>` : ""}</article><div class="answer-controls ${revealed && s.claim === "known" ? "rating-controls" : ""}" aria-label="Answer controls">${controls}</div></section>`;
}
function render() {
  if (state === undefined || failed) return;
  if (
    location.hash === "#study" &&
    state.session !== null &&
    state.session.phase !== "complete"
  )
    study();
  else home();
  document.title = location.hash === "#study" ? "Study · Kibra" : "Kibra";
}
function showInformation() {
  const q = question(state.session!.questionId);
  const sources = q.sources.filter(
    (r, i, all) =>
      all.findIndex((x) => x.sourceId === r.sourceId && x.page === r.page) ===
      i,
  );
  const origin = q.origin;
  dialogContent.innerHTML = `<h2>Question sources</h2><p>${origin !== undefined ? `Historical exam prompt (${origin.year}). The answer is grounded in course material.` : q.provenance !== undefined ? "Course study-guide revision question." : "Authored revision question grounded in course material."}</p>${sources
    .map((r) => {
      const source = sourceById.get(r.sourceId)!;
      return `<section class="source"><h3>${escape(source.title)}</h3><p>${source.kind === "pptx" ? "Slide" : "Page"} ${r.page}</p><blockquote>${escape(r.excerpt)}</blockquote></section>`;
    })
    .join("")}`;
  dialog.showModal();
}
function decompose(s: Session, q: Question): Session {
  const children = q.prerequisiteQuestionIds.filter(
    (id) => !s.seenIds.includes(id),
  );
  return {
    ...s,
    frames: [
      ...s.frames,
      { parentId: q.id, childIds: children, remainingIds: children.slice(1) },
    ],
    decomposedIds: [...s.decomposedIds, q.id],
    parts: children,
    partIndex: 0,
    questionId: children[0],
    phase: "answer",
    claim: null,
    answer: "",
    assisted: true,
  };
}
function advance(s: Session, rating: AnswerRating): Session {
  const frame = s.frames.at(-1);
  if (frame === undefined)
    return { ...s, phase: "complete", completedRating: rating };
  if (frame.remainingIds.length > 0) {
    const nextId = frame.remainingIds[0];
    return {
      ...s,
      frames: [
        ...s.frames.slice(0, -1),
        { ...frame, remainingIds: frame.remainingIds.slice(1) },
      ],
      questionId: nextId,
      parts: frame.childIds,
      partIndex: frame.childIds.indexOf(nextId),
      phase: "answer",
      claim: null,
      answer: "",
      assisted: true,
    };
  }
  return {
    ...s,
    frames: s.frames.slice(0, -1),
    parts: [],
    partIndex: 0,
    questionId: frame.parentId,
    phase: "answer",
    claim: null,
    answer: "",
    assisted: true,
  };
}
function followingSession(
  s: Session,
  attempts = state.attempts,
  reviews = state.reviews,
): Session | null {
  if (s.phase !== "complete") return s;
  const next = recommend({ ...state, session: s, attempts, reviews });
  return next === undefined ? null : startSession(next.question.id);
}
async function rate(rating: AnswerRating, missedBeforeReveal = false) {
  const s = state.session!;
  const q = question(s.questionId);
  const now = new Date();
  const attempt: StudyAttempt = {
    id: crypto.randomUUID(),
    questionId: q.id,
    courseId: q.courseId,
    answeredAt: now.toISOString(),
    answer: "",
    rating,
    independent: !s.seenIds.includes(q.id),
    rootId: s.rootId,
    sessionStartedAt: s.startedAt,
  };
  const previous = state.reviews.find((r) => r.questionId === q.id);
  const review =
    rating !== "again" && s.seenIds.includes(q.id)
      ? (previous ?? scheduleReview(q.id, "again", undefined, now))
      : scheduleReview(q.id, rating, previous, now);
  const updated = {
    ...s,
    seenIds: [...new Set([...s.seenIds, q.id])],
    lastActiveAt: now.toISOString(),
  };
  const canStepBack =
    q.prerequisiteQuestionIds.some((id) => !s.seenIds.includes(id)) &&
    !s.decomposedIds.includes(q.id);
  const next =
    rating === "again" && canStepBack
      ? decompose(updated, q)
      : missedBeforeReveal
        ? { ...updated, phase: "feedback" as const, claim: "unknown" as const }
        : advance(updated, rating);
  const session = followingSession(
    next,
    [...state.attempts, attempt],
    [...state.reviews.filter((r) => r.questionId !== q.id), review],
  );
  await save({ session, attempt, review });
  if (session === null) location.hash = "#home";
  render();
  window.scrollTo(0, 0);
}
view.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (target === null || busy || failed) return;
  const action = target.dataset.action;
  if (action === "home") {
    location.hash = "#home";
    return;
  }
  if (action === "information") {
    showInformation();
    return;
  }
  if (action === "install") {
    showInstall();
    return;
  }
  busy = true;
  for (const button of view.querySelectorAll<HTMLButtonElement>("button"))
    button.disabled = true;
  enqueue(async () => {
    if (target.dataset.minutes !== undefined) {
      const availableMinutes =
        target.dataset.minutes === "null"
          ? null
          : (Number(target.dataset.minutes) as 5 | 10 | 20 | 60);
      const now = new Date();
      const preferences = {
        ...state.preferences,
        availableMinutes,
        firstOpenedAt: state.preferences.firstOpenedAt ?? now.toISOString(),
      };
      const next = recommend({ ...state, preferences }, now, { fresh: true });
      await save({
        preferences: {
          ...preferences,
          ...(next === undefined ? {} : { lastOpenedRootId: next.question.id }),
        },
        session:
          next === undefined ? null : startSession(next.question.id, now),
      });
      location.hash = next === undefined ? "#home" : "#study";
      render();
      return;
    }
    if (target.dataset.rating !== undefined) {
      await rate(target.dataset.rating as AnswerRating);
      return;
    }
    switch (action) {
      case "known":
        await save({
          session: {
            ...state.session!,
            phase: "feedback",
            claim: "known",
            lastActiveAt: new Date().toISOString(),
          },
        });
        render();
        view
          .querySelector<HTMLElement>(".answer")!
          .focus({ preventScroll: true });
        break;
      case "unknown":
        await rate("again", true);
        break;
      case "continue": {
        const session = followingSession(
          advance(
            { ...state.session!, lastActiveAt: new Date().toISOString() },
            "again",
          ),
        );
        await save({ session });
        if (session === null) location.hash = "#home";
        render();
        window.scrollTo(0, 0);
        break;
      }
      case "update":
        await updateSW(true);
        break;
    }
  });
});
window.addEventListener("hashchange", render);
document.addEventListener("visibilitychange", () => {
  if (
    document.hidden ||
    state === undefined ||
    busy ||
    failed ||
    location.hash !== "#study" ||
    canResume(state.session)
  )
    return;
  busy = true;
  enqueue(async () => {
    await save({ session: null });
    location.hash = "#home";
    render();
  });
});
loadState()
  .then(async (saved) => {
    state = saved;
    if (canResume(state.session)) location.hash = "#study";
    else {
      if (state.session !== null) await save({ session: null });
      location.hash = "#home";
    }
    render();
  })
  .catch(storageError);
const updateSW = registerSW({
  onNeedRefresh() {
    updateAvailable = true;
    if (state !== undefined && location.hash !== "#study") render();
  },
  onRegisterError(error) {
    console.error("Could not prepare offline revision", error);
  },
});
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let installPrompt: InstallPrompt | undefined;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPrompt;
});
function showInstall() {
  if (installPrompt !== undefined) {
    const prompt = installPrompt;
    installPrompt = undefined;
    void prompt.prompt().catch(storageError);
    return;
  }
  const ios =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  dialogContent.innerHTML = `<h2>Install app</h2>${ios ? "<p>In Chrome on your iPhone, tap Share, then Add to Home Screen.</p><p>If Add to Home Screen is missing, open this address in Safari. Tap Share, then Add to Home Screen.</p>" : "<p>Open your browser menu and choose Install app or Add to Home Screen.</p>"}`;
  dialog.showModal();
}
dialog.addEventListener("click", (event) => {
  if (
    (event.target as HTMLElement).closest('[data-action="close"]') !== null ||
    event.target === dialog
  )
    dialog.close();
});

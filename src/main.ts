import "./style.css";
import { knowledgeShape, controlIcon } from "./ui/visuals";
import { escape, presentQuestion } from "./ui/question";
import { advance, decompose, canStepBack } from "./study/traversal";
import { automaticUpdates } from "./persistence/updates";
import {
  assessments,
  question,
  questionById,
  studyQuestionIds,
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
import {
  independentEvidence,
  recommend,
  scheduleReview,
} from "./study/scheduler";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<main id="main"><div id="error" role="alert" hidden></div><div id="view"></div></main><dialog id="information"><button class="icon-button close" data-action="close" aria-label="Close">${controlIcon("close")}</button><div id="dialog-content"></div></dialog>`;
const view = document.querySelector<HTMLElement>("#view")!;
const dialog = document.querySelector<HTMLDialogElement>("#information")!;
const dialogContent = document.querySelector<HTMLElement>("#dialog-content")!;
let state: LearnerState;
let busy = false;
let failed = false;
let pending = 0;
let queue: Promise<void> = Promise.resolve();
const applyPendingUpdate = automaticUpdates(
  () =>
    state !== undefined &&
    pending === 0 &&
    !(
      location.hash === "#study" &&
      state.session?.openResponses?.[state.session.questionId]?.stage ===
        "write"
    ),
);

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
    new Error("Close other Recall tabs, then reload to open saved progress."),
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
      applyPendingUpdate();
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
    !questionById.has(session.questionId) ||
    session.frames.some((frame) =>
      [frame.parentId, ...frame.childIds].some((id) => !questionById.has(id)),
    ) ||
    (!studyQuestionIds.has(session.rootId) &&
      new URLSearchParams(location.search).get("review") !== "1")
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
  view.innerHTML = `<section class="home"><a class="home-brand" href="#home">Recall</a><h1>How much time do you have?</h1><div class="time-options" role="group" aria-label="Available study time">${[
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
    )}</div><div class="home-tools"><button class="text-button" data-action="install">Install app</button></div></section>`;
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
  const response = s.openResponses?.[q.id];
  const { content, controls, ratingControls, openModel } = presentQuestion(q, {
    revealed,
    unknown: s.claim === "unknown",
    selected: s.selectedChoice,
    openStage: response?.stage,
    draft: response?.draft,
    openReady:
      q.prerequisiteQuestionIds.length > 0 &&
      q.prerequisiteQuestionIds.every((id) => {
        const evidence = independentEvidence(state.attempts, id);
        return evidence !== undefined && evidence.rating !== "again";
      }),
  });
  view.innerHTML = `<section class="study ${revealed ? "revealed" : ""} ${openModel ? "open-model" : ""}"><div class="study-tools"><button class="icon-button" data-action="home" aria-label="Home">${controlIcon("home")}</button>${knowledgeShape(s.rootId, s.questionId, previousId)}<button class="icon-button" data-action="information" aria-label="Question information">${controlIcon("info")}</button></div><article class="card"><h1 id="question-prompt" class="question-prompt">${escape(q.prompt)}</h1>${content}</article><div class="answer-controls ${ratingControls ? "rating-controls" : ""}" aria-label="Answer controls">${controls}</div></section>`;
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
  document.title = location.hash === "#study" ? "Study · Recall" : "Recall";
  applyPendingUpdate();
}
async function reveal() {
  const front = view.querySelector<HTMLElement>(".card");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (front !== null && !reduced) {
    front.animate(
      [
        { transform: "perspective(1200px) rotateY(0deg)" },
        { transform: "perspective(1200px) rotateY(90deg)" },
      ],
      { duration: 140, easing: "ease-in", fill: "forwards" },
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 140));
  }
  render();
  const back = view.querySelector<HTMLElement>(".card");
  if (back !== null && !reduced)
    back.animate(
      [
        { transform: "perspective(1200px) rotateY(-90deg)" },
        { transform: "perspective(1200px) rotateY(0deg)" },
      ],
      { duration: 160, easing: "ease-out" },
    );
}
function showInformation() {
  const q = question(state.session!.questionId);
  const sources = q.sources.filter(
    (r, i, all) =>
      all.findIndex(
        (x) =>
          x.sourceId === r.sourceId &&
          x.page === r.page &&
          x.excerpt === r.excerpt,
      ) === i,
  );
  const origin = q.origin;
  dialogContent.innerHTML = `<h2>Question sources</h2><p>${origin !== undefined ? `Historical exam prompt (${origin.year}). The answer is grounded in course material.` : q.provenance !== undefined ? "Course study-guide revision question." : "Authored revision question grounded in course material."}</p>${sources
    .map((r) => {
      const source = sourceById.get(r.sourceId)!;
      const locator =
        r.page === undefined
          ? r.section === undefined
            ? ""
            : ` · ${escape(r.section)}`
          : ` · ${source.kind === "pptx" ? "Slide" : typeof r.page === "number" ? "Page" : "Section"} ${escape(String(r.page))}`;
      return `<section class="source"><h3>${escape(source.title)}</h3><p>${escape(source.id === "pharm" ? "Course study guide" : source.id === "schedule" ? "Schedule linked from Stream" : source.file.startsWith("pharmacology-old-exams/") ? "Supplied historical exam" : source.file.startsWith("raw-stream-files/") ? "Teaching material downloaded from Stream" : source.file.startsWith("raw-stream-html/") ? "Course page captured from Stream" : source.collection === "supplementary" ? "Supplementary reference" : "Source material")}${locator}</p><blockquote>${escape(r.excerpt)}</blockquote><p>${escape(source.file)}</p>${(source.url ?? source.contextUrl) === undefined ? "" : `<a href="${escape((source.url ?? source.contextUrl)!)}" target="_blank" rel="noopener">Open original source</a>`}</section>`;
    })
    .join("")}`;
  dialog.showModal();
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
function supportingIds(q: Question): string[] {
  const ids = new Set<string>();
  function visit(parent: Question) {
    for (const id of parent.prerequisiteQuestionIds) {
      if (ids.has(id)) continue;
      ids.add(id);
      visit(question(id));
    }
  }
  visit(q);
  return [...ids];
}
async function rate(
  rating: AnswerRating,
  mode: "advance" | "unknown" | "choice" = "advance",
  selectedChoice?: number,
  sessionOverride?: Session,
) {
  const s = sessionOverride ?? state.session!;
  const q = question(s.questionId);
  const now = new Date();
  const attempt: StudyAttempt = {
    id: crypto.randomUUID(),
    questionId: q.id,
    courseId: q.courseId,
    answeredAt: now.toISOString(),
    answer:
      selectedChoice === undefined
        ? (s.openResponses?.[q.id]?.draft ?? "")
        : q.interaction?.type === "multiple-choice" ||
            q.interaction?.type === "true-false"
          ? q.interaction.choices[selectedChoice]
          : "",
    rating,
    independent: !s.seenIds.includes(q.id) && !(s.cuedIds ?? []).includes(q.id),
    rootId: s.rootId,
    sessionStartedAt: s.startedAt,
  };
  const previous = state.reviews.find((r) => r.questionId === q.id);
  const review =
    rating !== "again" && !attempt.independent
      ? (previous ?? scheduleReview(q.id, "again", undefined, now))
      : scheduleReview(q.id, rating, previous, now);
  const updated = {
    ...s,
    cuedIds: [
      ...new Set([
        ...(s.cuedIds ?? []),
        ...(rating === "again" && (s.claim === "known" || mode === "choice")
          ? supportingIds(q)
          : []),
      ]),
    ],
    seenIds: [...new Set([...s.seenIds, q.id])],
    recalledIds:
      rating === "again"
        ? (s.recalledIds ?? []).filter((id) => id !== q.id)
        : [...new Set([...(s.recalledIds ?? []), q.id])],
    lastActiveAt: now.toISOString(),
  };
  const next =
    mode === "choice"
      ? {
          ...updated,
          phase: "feedback" as const,
          claim: rating === "again" ? ("unknown" as const) : ("known" as const),
          selectedChoice,
        }
      : rating === "again" && canStepBack(s, q)
        ? decompose(updated, q)
        : mode === "unknown"
          ? {
              ...updated,
              phase: "feedback" as const,
              claim: "unknown" as const,
            }
          : advance(updated, rating);
  if (
    mode === "unknown" &&
    next.phase === "feedback" &&
    q.interaction?.type === "open-answer"
  ) {
    const response = next.openResponses?.[q.id] ?? {
      stage: "preview",
      draft: "",
    };
    next.openResponses = {
      ...next.openResponses,
      [q.id]: { ...response, stage: "model" },
    };
  }
  const session = followingSession(
    next,
    [...state.attempts, attempt],
    [...state.reviews.filter((r) => r.questionId !== q.id), review],
  );
  await save({ session, attempt, review });
  if (session === null) location.hash = "#home";
  if (mode === "unknown" && session?.phase === "feedback") await reveal();
  else render();
  window.scrollTo(0, 0);
}
view.addEventListener("input", (event) => {
  if (
    !(event.target instanceof HTMLTextAreaElement) ||
    event.target.readOnly ||
    failed ||
    state.session === null
  )
    return;
  const { questionId, startedAt } = state.session;
  const draft = event.target.value;
  const button = view.querySelector<HTMLButtonElement>('[data-action="model"]');
  if (button !== null) button.disabled = draft.trim().length === 0;
  enqueue(async () => {
    const s = state.session;
    if (
      s === null ||
      s.questionId !== questionId ||
      s.startedAt !== startedAt ||
      s.openResponses?.[questionId]?.stage !== "write"
    )
      return;
    await save({
      session: {
        ...s,
        openResponses: {
          ...s.openResponses,
          [questionId]: { stage: "write", draft },
        },
        lastActiveAt: new Date().toISOString(),
      },
    });
  });
});
view.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (target === null || target.disabled || busy || failed) return;
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
  if (action === "dictation") {
    dialogContent.innerHTML =
      "<h2>Dictate your answer</h2><p>Tap the answer field, then use the microphone on your phone’s keyboard. You can edit the words before showing the model answer.</p>";
    dialog.showModal();
    return;
  }
  busy = true;
  for (const button of view.querySelectorAll<HTMLButtonElement>("button"))
    button.disabled = true;
  enqueue(async () => {
    if (target.dataset.minutes !== undefined) {
      state = await loadState();
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
    if (target.dataset.choice !== undefined) {
      const selected = Number(target.dataset.choice);
      const interaction = question(state.session!.questionId).interaction;
      if (
        interaction?.type !== "multiple-choice" &&
        interaction?.type !== "true-false"
      )
        throw new Error(
          "Cannot mark a choice: the current question has no answer choices. Reload to restore the saved question.",
        );
      if (
        !Number.isInteger(selected) ||
        selected < 0 ||
        selected >= interaction.choices.length
      )
        throw new Error(
          `Cannot mark choice ${selected}: this question has ${interaction.choices.length} choices. Reload the saved question.`,
        );
      await rate(
        selected === interaction.correctChoice ? "good" : "again",
        "choice",
        selected,
      );
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
        await reveal();
        view
          .querySelector<HTMLElement>(".answer")
          ?.focus({ preventScroll: true });
        break;
      case "unknown":
        if (
          question(state.session!.questionId).interaction?.type ===
          "open-answer"
        ) {
          const s = state.session!;
          const response = s.openResponses?.[s.questionId] ?? {
            stage: "preview",
            draft: "",
          };
          await rate("again", "unknown", undefined, {
            ...s,
            openResponses: {
              ...s.openResponses,
              [s.questionId]: { ...response, stage: "supports" },
            },
          });
        } else await rate("again", "unknown");
        break;
      case "write": {
        const s = state.session!;
        await save({
          session: {
            ...s,
            openResponses: {
              ...s.openResponses,
              [s.questionId]: {
                stage: "write",
                draft: s.openResponses?.[s.questionId]?.draft ?? "",
              },
            },
            lastActiveAt: new Date().toISOString(),
          },
        });
        render();
        view.querySelector<HTMLTextAreaElement>("textarea")?.focus();
        break;
      }
      case "break-down": {
        const s = state.session!;
        const q = question(s.questionId);
        const response = s.openResponses?.[q.id] ?? {
          stage: "preview",
          draft: "",
        };
        const updated: Session = {
          ...s,
          cuedIds: [...new Set([...(s.cuedIds ?? []), q.id])],
          openResponses: {
            ...s.openResponses,
            [q.id]: { ...response, stage: "supports" },
          },
          lastActiveAt: new Date().toISOString(),
        };
        const session = canStepBack(s, q)
          ? decompose(updated, q)
          : {
              ...updated,
              phase: "feedback" as const,
              claim: "unknown" as const,
              openResponses: {
                ...updated.openResponses,
                [q.id]: { ...response, stage: "model" as const },
              },
            };
        await save({ session });
        render();
        window.scrollTo(0, 0);
        break;
      }
      case "model": {
        const s = state.session!;
        const response = s.openResponses![s.questionId];
        if (response.draft.trim().length === 0) {
          render();
          break;
        }
        await save({
          session: {
            ...s,
            phase: "feedback",
            claim: "known",
            openResponses: {
              ...s.openResponses,
              [s.questionId]: { ...response, stage: "model" },
            },
            lastActiveAt: new Date().toISOString(),
          },
        });
        await reveal();
        break;
      }
      case "repair": {
        const s = state.session!;
        const q = question(s.questionId);
        await save({
          session: canStepBack(s, q)
            ? decompose(s, q)
            : {
                ...s,
                selectedChoice: undefined,
                claim: "unknown",
                phase: "feedback",
              },
        });
        render();
        window.scrollTo(0, 0);
        break;
      }
      case "continue": {
        const s = state.session!;
        const q = question(s.questionId);
        if (
          q.interaction?.type === "open-answer" &&
          s.claim === "unknown" &&
          !s.seenIds.includes(q.id)
        ) {
          await rate("again");
          break;
        }
        const session = followingSession(
          advance(
            { ...s, lastActiveAt: new Date().toISOString() },
            s.claim === "known" ? "good" : "again",
          ),
        );
        await save({ session });
        if (session === null) location.hash = "#home";
        render();
        window.scrollTo(0, 0);
        break;
      }
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
    const reviewQuestion = new URLSearchParams(location.search).get("question");
    if (
      new URLSearchParams(location.search).get("review") === "1" &&
      reviewQuestion !== null
    ) {
      question(reviewQuestion);
      await save({ session: startSession(reviewQuestion) });
      const url = new URL(location.href);
      url.searchParams.delete("question");
      url.hash = "study";
      history.replaceState(null, "", url);
    } else if (canResume(state.session)) location.hash = "#study";
    else {
      if (state.session !== null) await save({ session: null });
      location.hash = "#home";
    }
    render();
    applyPendingUpdate();
  })
  .catch(storageError);
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

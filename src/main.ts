import "./style.css";
import { conceptIcon, icon } from "./ui/visuals";
import { registerSW } from "virtual:pwa-register";
import {
  courses,
  assessments,
  units,
  questions,
  question,
  clusterById,
  sourceById,
  type Question,
  type SourceReference,
} from "./content/curriculum";
import { loadState, persist } from "./persistence/database";
import {
  startSession,
  type LearnerState,
  type Session,
  type AnswerRating,
} from "./study/state";
import {
  recommend,
  scheduleReview,
  independentEvidence,
} from "./study/scheduler";
const app = document.querySelector<HTMLDivElement>("#app")!;
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const date = (value: string) =>
  new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    timeZone: "Pacific/Auckland",
  }).format(new Date(value));
app.innerHTML = `<a class="skip" href="#main">Skip to content</a><header><a class="brand" href="#home" aria-label="Kibra home"><span class="brand-mark">k</span> kibra<span class="brand-caption">NURSING REVISION</span></a><span class="personal">Made for you <span class="avatar">K</span></span></header><main id="main"><div id="error" role="alert" hidden></div><div id="view"><p class="loading">Opening your revision…</p></div><footer><span class="footer-mark" aria-hidden="true">✧</span><p>Understanding first. Confidence follows.</p><span id="offline-status" role="status">Preparing offline access…</span><button id="install" hidden>Install Kibra</button><button id="update" hidden>Update available · Reload</button></footer></main><nav aria-label="Main navigation"><a href="#home"><span aria-hidden="true">⌂</span>Home</a><a href="#courses"><span aria-hidden="true">▦</span>Courses</a></nav>`;
const view = document.querySelector<HTMLElement>("#view")!;
let state: LearnerState;
let busy = false;
let failed = false;
let queue: Promise<void> = Promise.resolve();
let pending = 0;
function storageError(error: unknown) {
  console.error("Could not save nursing revision progress", error);
  failed = true;
  const banner = document.querySelector<HTMLElement>("#error")!;
  banner.hidden = false;
  banner.textContent = `Progress could not be saved. Keep this page open and copy any answer you want to keep. ${error instanceof Error ? error.message : "Browser storage is unavailable. Check browser storage settings, then reload."}`;
  for (const b of view.querySelectorAll<HTMLButtonElement>("button"))
    b.disabled = true;
}
window.addEventListener("storage-blocked", () =>
  storageError(
    new Error(
      "Close other Kibra tabs, then reload to open the saved progress.",
    ),
  ),
);
window.addEventListener("beforeunload", (event) => {
  if (pending > 0) {
    event.preventDefault();
  }
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
function sourceDetails(refs: SourceReference[]) {
  const unique = refs.filter(
    (r, i) =>
      refs.findIndex((x) => x.sourceId === r.sourceId && x.page === r.page) ===
      i,
  );
  return `<details class="sources"><summary>Course sources</summary>${unique
    .map((r) => {
      const s = sourceById.get(r.sourceId)!;
      return `<div><strong>${escape(s.title)} · ${s.kind === "authored" || s.kind === "html" || s.kind === "docx" ? (s.kind === "authored" ? "practice method" : "captured content") : `${s.kind === "pptx" ? "slide" : "PDF page"} ${r.page}`}</strong><p>${escape(r.excerpt)}</p><small>${escape(s.file.split("/").at(-1)!)}</small></div>`;
    })
    .join("")}</details>`;
}
function diagram(q: Question, revealed: boolean, session?: Session) {
  const cluster = clusterById.get(q.clusterId)!;
  const d = cluster.diagram;
  const seen = new Set(
    q.kind === "constructed" ? [] : (session?.seenIds ?? []),
  );
  return `<figure class="diagram ${d.kind} ${q.kind === "constructed" ? "overview" : "focus"}" aria-label="${escape(cluster.title)} knowledge map"><figcaption>${q.courseId === "integrated-care" ? icon("family") : ""}${escape(d.central)}</figcaption><div class="diagram-nodes">${d.nodes
    .map((node, index) => {
      const current =
        q.kind === "recall" && q.conceptIds.includes(node.conceptId);
      const filled =
        (revealed && (q.kind === "constructed" || current)) ||
        seen.has(node.conceptId);
      const recall = question(node.conceptId);
      return `<div class="diagram-node ${current ? "current" : ""} ${filled ? "filled" : "gap"}">${conceptIcon(node.conceptId)}<div class="node-top"><span class="node-number">${index + 1}</span><strong>${escape(node.label)}</strong>${current ? '<span class="here">You are here</span>' : ""}</div><p>${escape(filled ? node.answer : recall.prompt)}</p>${filled ? '<span class="node-state">Reconstructed</span>' : '<span class="node-state">Recall this piece</span>'}</div>`;
    })
    .join("")}</div></figure>`;
}
function canResume(session: Session | null): session is Session {
  return (
    session !== null &&
    session.phase !== "complete" &&
    assessments.some(
      (a) =>
        a.courseId === question(session.rootId).courseId &&
        new Date(a.date).getTime() > Date.now(),
    )
  );
}
function home() {
  const next = recommend(state);
  const session = state.session;
  const resume = canResume(session);
  const q = resume ? question(session.questionId) : next?.question;
  const exam =
    q === undefined
      ? undefined
      : assessments.find((a) => a.courseId === q.courseId)!;
  const course = courses.find((c) => c.id === q?.courseId);
  const completed = state.attempts.filter(
    (a) => a.independent && a.rating !== "again",
  ).length;
  view.innerHTML = `<section class="intro"><p class="eyebrow">A LITTLE TIME. A CLEAR NEXT STEP.</p><h1>Your space to<br><em>make it click.</em></h1><p class="intro-copy">Welcome, Kibra. ${completed > 0 ? "Keep building what you can recall." : "Start with a question. We’ll help you connect the pieces."}</p></section><section class="revision"><div class="revision-copy"><p class="eyebrow">${resume ? "YOUR SAVED STEP" : "YOUR NEXT STEP"}</p><h2>${escape(q?.title ?? (q === undefined ? (assessments.every((a) => new Date(a.date).getTime() <= Date.now()) ? "Assessments complete." : "A good place to pause.") : clusterById.get(q.clusterId)!.title))}</h2><p>${resume ? "Your answer and place are saved. Pick up where you left off." : escape(next?.reason ?? (assessments.every((a) => new Date(a.date).getTime() <= Date.now()) ? "Your study history stays on this device." : "Your studied questions are waiting for their next spaced review."))}</p>${q === undefined ? "" : `<div class="assessment-chip">${course!.label} · ${date(exam!.date)} · ${exam!.weight}%</div><button class="primary light" data-action="start">${resume ? "Resume studying" : "Start studying"} <span aria-hidden="true">→</span></button>`}</div><div class="path-art" aria-hidden="true"><svg viewBox="0 0 280 200"><path d="M30 160C30 80 140 180 140 100S250 120 250 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 7"/><circle cx="30" cy="160" r="13" fill="#dce7ad"/><circle cx="140" cy="100" r="13" fill="#b8c9ba"/><circle cx="250" cy="35" r="19" fill="#dce7ad"/><path d="m241 35 6 6 12-13" fill="none" stroke="#193f37" stroke-width="3"/></svg><span>Question → understanding → recall</span></div></section><section class="time-section"><h2>What does your day allow?</h2><p>You can always keep going or stop early.</p><div class="time-options" role="group" aria-label="Available study time">${[
    [5, "5 min"],
    [20, "20 min"],
    [60, "An hour +"],
    [null, "Go with the flow"],
  ]
    .map(
      ([minutes, label]) =>
        `<button data-minutes="${minutes}" aria-pressed="${minutes === state.preferences.availableMinutes}">${label}</button>`,
    )
    .join(
      "",
    )}</div><p id="save-status" class="save-status" role="status">Your preference stays on this device.</p></section>`;
}
function coursesView() {
  view.innerHTML = `<section class="curriculum"><p class="eyebrow">YOUR CURRICULUM</p><h1>The whole picture.</h1><p class="intro-copy">Independent answers show what you can recall. Helped practice builds understanding.</p>${courses
    .map((course) => {
      const exam = assessments.find((a) => a.courseId === course.id)!;
      const roots = questions.filter(
        (q) => q.courseId === course.id && q.kind === "constructed",
      );
      const correct = roots.filter((q) => {
        const a = independentEvidence(state.attempts, q.id);
        return a !== undefined && a.rating !== "again";
      }).length;
      const due = state.reviews.filter(
        (r) =>
          r.card.due.getTime() <= Date.now() &&
          question(r.questionId).courseId === course.id,
      ).length;
      return `<article class="course ${course.id}"><h2>${course.name}</h2><p class="assessment-line">${date(exam.date)} · ${exam.weight}% · ${escape(exam.title)}</p><p>${correct} independent answer${correct === 1 ? "" : "s"} · ${roots.filter((q) => !state.attempts.some((a) => a.questionId === q.id)).length} untested questions · ${due} reviews due</p><div class="unit-map">${units
        .filter((u) => u.courseId === course.id)
        .map((u) => {
          const qs = roots.filter((q) => q.unitId === u.id);
          return `<details class="unit"><summary><span class="unit-number">${u.order.toString().padStart(2, "0")}</span><span>${escape(u.title)}</span><span class="unit-count">${qs.length} questions</span></summary><p>${escape(u.scope)}</p><div class="topic-map">${qs
            .map((q) => {
              const a = independentEvidence(state.attempts, q.id);
              const status =
                a === undefined
                  ? state.attempts.some((x) => x.questionId === q.id)
                    ? "Practised with help"
                    : "Untested"
                  : a.rating === "again"
                    ? "Needs another recall"
                    : "Recalled independently";
              return `<div class="topic ${a !== undefined && a.rating !== "again" ? "recalled" : ""}"><strong>${escape(q.title!)}</strong><span>${status}</span></div>`;
            })
            .join(
              "",
            )}</div>${u.gaps.length === 0 ? "" : `<aside class="coverage"><strong>Coverage to complete</strong><ul>${u.gaps.map((g) => `<li>${escape(g)}</li>`).join("")}</ul></aside>`}</details>`;
        })
        .join(
          "",
        )}</div><details class="assessment-details"><summary>Assessment scope and sources</summary><p>${escape(exam.format)}</p><p>${escape(exam.scope)}</p>${sourceDetails(exam.sources)}</details></article>`;
    })
    .join("")}</section>`;
}
function studyView() {
  const s = state.session;
  if (s === null) {
    location.hash = "#home";
    return;
  }
  const q = question(s.questionId);
  const course = courses.find((c) => c.id === q.courseId)!;
  const unit = units.find((u) => u.id === q.unitId)!;
  const root = question(s.rootId);
  const part = q.id !== s.rootId;
  const stage = part
    ? "Build the understanding"
    : s.assisted
      ? "Return to the whole question"
      : q.kind === "constructed"
        ? "Exam-style practice"
        : "Spaced recall";
  if (s.phase === "complete") {
    view.innerHTML = `<section class="completion"><p class="eyebrow">ONE USEFUL STEP</p><h1>${s.assisted || s.completedRating === "again" ? "Understanding<br>takes shape." : "Recall grows<br>stronger."}</h1><p class="result-label">${s.assisted ? "Practised with help" : s.completedRating === "again" ? "Needs another recall" : "Recalled independently"}</p><p>${s.assisted ? "You returned to the question after working through its pieces. A later answer without help will check independent recall." : "Your next review is scheduled. The next question balances both assessments and what you need to learn."}</p><button class="primary" data-action="next">Next question <span aria-hidden="true">→</span></button><a class="quiet-link" href="#home">Pause here</a></section>`;
    return;
  }
  const revealed = s.phase === "feedback";
  const unknown = s.claim === "unknown";
  view.innerHTML = `<section class="study"><div class="study-top"><p class="eyebrow">${course.label} / ${escape(unit.title)}</p><a class="quiet-link" href="#home">Pause</a></div><p class="stage">${stage}</p>${part ? `<p class="parent-question">Working towards: ${escape(root.title!)}</p>${s.parts.length > 0 ? `<div class="piece-progress">Piece ${s.partIndex + 1} of ${s.parts.length}</div>` : ""}` : ""}<h1 class="question-title">${escape(q.title ?? clusterById.get(q.clusterId)!.title)}</h1><p id="question-prompt" class="question-prompt">${escape(q.prompt)}</p>${q.origin === undefined ? `<p class="question-origin">${q.kind === "constructed" ? "Course-based practice · self-mark against the guide" : "Recall a fundamental piece"}</p>` : `<p class="question-origin">${q.origin.year} past examination · ${q.origin.marks} marks · answer guide derived from the course</p>`}${diagram(q, revealed, s)}<label class="answer-label" for="answer">Your answer <span>${q.kind === "constructed" ? "Write the explanation you would give in the test." : "Recall first, then check."}</span></label><textarea id="answer" aria-label="Your answer" rows="${q.kind === "constructed" ? 6 : 3}" placeholder="Put it in your own words…" ${revealed ? "readonly" : ""}>${escape(s.answer)}</textarea><p id="draft-status" role="status">Answer saved on this device.</p>${!revealed ? `<div class="answer-actions"><button class="primary" data-action="known">I know it</button><button class="secondary" data-action="unknown">I don’t know it</button></div>` : `<section class="feedback"><h2>Marking guide</h2><p class="marking-instruction">Check each point against your answer. Include the links between mechanism, effect and care where asked.</p><ol class="rubric">${q.rubric.map((r) => `<li>${escape(r)}</li>`).join("")}</ol>${unknown ? `<p class="learning-note">This needs more recall. Let’s build the pieces.</p><button class="primary" data-action="continue">${!s.decomposedIds.includes(q.id) && q.prerequisiteQuestionIds.length > 0 ? "Work through the pieces" : "Continue"}</button>` : `<h3>How was your recall?</h3><div class="ratings"><button data-rating="hard"><strong>Hard</strong><span>Correct, with effort</span></button><button data-rating="good"><strong>Good</strong><span>Correct, steady recall</span></button><button data-rating="easy"><strong>Easy</strong><span>Quick and complete</span></button></div><button class="correction" data-rating="again">I missed it</button>`}</section>${sourceDetails(q.sources)}`}</section>`;
}
function render() {
  if (state === undefined) return;
  const route = location.hash;
  if (route === "#courses") coursesView();
  else if (route === "#study") studyView();
  else home();
  for (const link of document.querySelectorAll<HTMLAnchorElement>("nav a")) {
    if (link.hash === (route === "#courses" ? "#courses" : "#home"))
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.title =
    route === "#study"
      ? "Study · Kibra"
      : route === "#courses"
        ? "Your curriculum · Kibra"
        : "Kibra · Nursing revision";
}
function decompose(s: Session, q: Question): Session {
  return {
    ...s,
    frames: [
      ...s.frames,
      {
        parentId: q.id,
        childIds: q.prerequisiteQuestionIds,
        remainingIds: q.prerequisiteQuestionIds.slice(1),
      },
    ],
    decomposedIds: [...s.decomposedIds, q.id],
    parts: q.prerequisiteQuestionIds,
    partIndex: 0,
    questionId: q.prerequisiteQuestionIds[0],
    phase: "answer",
    claim: null,
    answer: "",
    assisted: true,
  };
}
async function rate(rating: AnswerRating) {
  const s = state.session!;
  const q = question(s.questionId);
  const now = new Date();
  const attempt = {
    id: crypto.randomUUID(),
    questionId: q.id,
    courseId: q.courseId,
    answeredAt: now.toISOString(),
    answer: s.answer,
    rating,
    independent: !s.assisted && q.id === s.rootId,
  };
  const review = scheduleReview(
    q.id,
    rating,
    state.reviews.find((r) => r.questionId === q.id),
    now,
  );
  const seenIds = [...new Set([...s.seenIds, q.id])];
  const next: Session =
    rating === "again"
      ? q.kind === "constructed" &&
        !s.assisted &&
        q.prerequisiteQuestionIds.length > 0
        ? decompose({ ...s, seenIds }, q)
        : { ...s, phase: "feedback", claim: "unknown", seenIds }
      : advance({ ...s, seenIds }, rating);
  await save({ session: next, attempt, review });
  render();
}
function advance(s: Session, rating: AnswerRating): Session {
  const frame = s.frames.at(-1);
  if (frame !== undefined) {
    if (frame.remainingIds.length > 0) {
      const nextId = frame.remainingIds[0];
      const updated = { ...frame, remainingIds: frame.remainingIds.slice(1) };
      return {
        ...s,
        frames: [...s.frames.slice(0, -1), updated],
        parts: frame.childIds,
        questionId: nextId,
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
  return { ...s, phase: "complete", completedRating: rating };
}
view.addEventListener("input", (event) => {
  const target = event.target;
  if (
    !(target instanceof HTMLTextAreaElement) ||
    target.id !== "answer" ||
    failed
  )
    return;
  const answer = target.value;
  const status = document.querySelector<HTMLElement>("#draft-status")!;
  status.textContent = "Saving answer…";
  enqueue(async () => {
    await save({ session: { ...state.session!, answer } });
    if (pending === 1 && status.isConnected)
      status.textContent = "Answer saved on this device.";
  });
});
view.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (target === null || busy || failed) return;
  busy = true;
  for (const button of view.querySelectorAll<HTMLButtonElement>("button"))
    button.disabled = true;
  enqueue(async () => {
    if (target.dataset.minutes !== undefined) {
      const availableMinutes =
        target.dataset.minutes === "null"
          ? null
          : (Number(target.dataset.minutes) as 5 | 20 | 60);
      await save({ preferences: { schemaVersion: 1, availableMinutes } });
      render();
      document.querySelector("#save-status")!.textContent =
        "Preference saved on this device.";
      return;
    }
    if (target.dataset.rating !== undefined) {
      await rate(target.dataset.rating as AnswerRating);
      return;
    }
    switch (target.dataset.action) {
      case "start": {
        if (!canResume(state.session)) {
          const next = recommend(state);
          if (next === undefined) {
            render();
            return;
          }
          await save({ session: startSession(next.question.id) });
        }
        location.hash = "#study";
        render();
        break;
      }
      case "next": {
        const next = recommend(state);
        await save({
          session: next === undefined ? null : startSession(next.question.id),
        });
        if (next === undefined) location.hash = "#home";
        render();
        break;
      }
      case "known":
        await save({
          session: { ...state.session!, phase: "feedback", claim: "known" },
        });
        render();
        break;
      case "unknown":
        await rate("again");
        break;
      case "continue": {
        const s = state.session!;
        const q = question(s.questionId);
        if (
          !s.decomposedIds.includes(q.id) &&
          q.prerequisiteQuestionIds.length > 0
        ) {
          await save({ session: decompose(s, q) });
        } else await save({ session: advance(s, "again") });
        render();
        break;
      }
    }
  });
});
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
});
setInterval(() => {
  if (
    state !== undefined &&
    location.hash !== "#study" &&
    location.hash !== "#courses" &&
    !busy &&
    pending === 0 &&
    !document.hidden
  )
    render();
}, 60000);
loadState()
  .then((saved) => {
    state = saved;
    if (location.hash === "#study") location.hash = "#home";
    render();
  })
  .catch(storageError);
const offlineStatus = document.querySelector<HTMLElement>("#offline-status")!;
const updateButton = document.querySelector<HTMLButtonElement>("#update")!;
const updateSW = registerSW({
  onOfflineReady() {
    offlineStatus.textContent = "Ready to open offline";
  },
  onNeedRefresh() {
    updateButton.hidden = false;
  },
  onRegisterError(error) {
    console.error("Offline setup failed", error);
    offlineStatus.textContent =
      "Offline access unavailable. Reopen while connected to try again.";
  },
});
updateButton.addEventListener("click", () =>
  enqueue(async () => {
    await updateSW(true);
  }),
);
if ("serviceWorker" in navigator)
  navigator.serviceWorker.ready.then(() => {
    offlineStatus.textContent = "Ready to open offline";
  });
else
  offlineStatus.textContent =
    "This browser does not support offline installation.";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let installPrompt: InstallPrompt | undefined;
const installButton = document.querySelector<HTMLButtonElement>("#install")!;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPrompt;
  installButton.hidden = false;
});
installButton.addEventListener("click", () =>
  enqueue(async () => {
    if (installPrompt === undefined) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = undefined;
    installButton.hidden = true;
  }),
);
window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
});

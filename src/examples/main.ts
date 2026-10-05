import "../style.css";
import "./style.css";
import { escape, presentQuestion } from "../ui/question";
import { automaticUpdates } from "../persistence/updates";
import { sourceById } from "../content/curriculum";
import { controlIcon, knowledgeShape } from "../ui/visuals";
import { card, examples, type ExampleKind } from "./content";

interface Frame {
  parentId: string;
  remaining: string[];
}
interface ExampleState {
  kind: ExampleKind;
  currentId: string;
  frames: Frame[];
  seen: string[];
  recalled: string[];
  revealed: boolean;
  unknown: boolean;
  selected: number | null;
  openStage: "preview" | "supports" | "write" | "model";
  draft: string;
}
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = `<main><div id="example-error" role="alert" hidden></div><div id="example-view"></div></main><dialog><button class="icon-button close" aria-label="Close">${controlIcon("close")}</button><div id="example-information"></div></dialog>`;
const view = document.querySelector<HTMLElement>("#example-view")!;
const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
const storageKey = "recall-question-examples-v1";
let state: ExampleState | null = null;
let previousId: string | undefined;
let busy = false;
const root = () =>
  examples.find((example) => example.id === state!.kind)!.rootId;
function save() {
  sessionStorage.setItem(storageKey, JSON.stringify(state));
}
function menu() {
  state = null;
  save();
  location.hash = "menu";
  render();
}
function start(kind: ExampleKind) {
  const example = examples.find((value) => value.id === kind)!;
  state = {
    kind,
    currentId: example.rootId,
    frames: [],
    seen: [],
    recalled: [],
    revealed: false,
    unknown: false,
    selected: null,
    openStage: "preview",
    draft: "",
  };
  previousId = undefined;
  save();
  location.hash = kind;
  render();
}
function render() {
  if (state === null) {
    document.body.dataset.course = "home";
    view.innerHTML = `<section class="home example-menu"><span class="home-brand">Recall</span><h1>Question examples</h1><div class="time-options">${examples.map((example) => `<button data-example="${example.id}">${example.label}</button>`).join("")}</div></section>`;
    return;
  }
  const s = state;
  const q = card(s.currentId);
  document.body.dataset.course = q.courseId;
  const { content, controls, ratingControls, openModel } = presentQuestion(
    {
      ...q,
      interaction:
        q.choices !== undefined
          ? {
              type: s.kind === "true-false" ? "true-false" : "multiple-choice",
              choices: q.choices,
              correctChoice: q.correctChoice!,
              incorrectExplanations: q.incorrectExplanations!,
            }
          : q.id === "example-ace"
            ? { type: "diagram", diagramId: "raas" }
            : s.kind === "open-answer" && s.currentId === root()
              ? { type: "open-answer" }
              : undefined,
    },
    {
      revealed: s.revealed,
      unknown: s.unknown,
      selected: s.selected ?? undefined,
      openStage: s.openStage,
      draft: s.draft,
    },
  );
  view.innerHTML = `<section class="study example-study ${openModel ? "open-model" : ""}"><div class="study-tools"><button class="icon-button" data-action="menu" aria-label="Examples">${controlIcon("home")}</button>${knowledgeShape(root(), s.currentId, previousId, (id) => card(id).prerequisiteQuestionIds)}<button class="icon-button" data-action="sources" aria-label="Question information">${controlIcon("info")}</button></div><article class="card"><h1 id="question-prompt" class="question-prompt">${escape(q.prompt)}</h1>${content}</article><div class="answer-controls ${ratingControls ? "rating-controls" : ""}">${controls}</div></section>`;
}
function move(id: string) {
  previousId = state!.currentId;
  state!.currentId = id;
  state!.revealed = false;
  state!.unknown = false;
  state!.selected = null;
}
function stepBack(): boolean {
  const s = state!;
  const children = card(s.currentId).prerequisiteQuestionIds.filter(
    (id) => !s.seen.includes(id),
  );
  if (children.length === 0) return false;
  s.frames.push({ parentId: s.currentId, remaining: children.slice(1) });
  move(children[0]);
  return true;
}
function advance() {
  const s = state!;
  const frame = s.frames.at(-1);
  if (frame === undefined) {
    menu();
    return;
  }
  if (frame.remaining.length > 0) {
    move(frame.remaining.shift()!);
    return;
  }
  s.frames.pop();
  move(frame.parentId);
  if (s.kind === "open-answer" && s.currentId === root()) {
    if (
      card(root()).prerequisiteQuestionIds.every((id) =>
        s.recalled.includes(id),
      )
    )
      s.openStage = "write";
    else {
      s.openStage = "model";
      s.unknown = true;
    }
  }
}
async function reveal(unknown: boolean) {
  const s = state!;
  s.revealed = true;
  s.unknown = unknown;
  save();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    view
      .querySelector<HTMLElement>(".card")!
      .animate(
        [
          { transform: "perspective(1200px) rotateY(0deg)" },
          { transform: "perspective(1200px) rotateY(90deg)" },
        ],
        { duration: 140, fill: "forwards" },
      );
    await new Promise<void>((resolve) => setTimeout(resolve, 140));
  }
  if (state !== s) return;
  render();
  if (!reduced)
    view
      .querySelector<HTMLElement>(".card")!
      .animate(
        [
          { transform: "perspective(1200px) rotateY(-90deg)" },
          { transform: "perspective(1200px) rotateY(0deg)" },
        ],
        { duration: 160 },
      );
}
function sources() {
  const q = card(state!.currentId);
  document.querySelector<HTMLElement>("#example-information")!.innerHTML =
    `<h2>Question sources</h2><p>Authored practice grounded in the supplied course material. Answers and the open-answer rubric are authored explanations, not an official exam marking key.</p>${q.sources
      .map((reference) => {
        const source = sourceById.get(reference.sourceId)!;
        return `<section class="source"><h3>${escape(source.title)}</h3><p>${source.id === "pharm" ? "Course study guide" : source.id === "schedule" ? "Schedule linked from Stream" : "Teaching material downloaded from Stream"} · PDF page ${reference.page}</p><blockquote>${escape(reference.excerpt)}</blockquote><p>${escape(source.file)}</p></section>`;
      })
      .join("")}`;
  dialog.showModal();
}
view.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLTextAreaElement) || state === null) return;
  state.draft = event.target.value;
  save();
  const showModel = view.querySelector<HTMLButtonElement>(
    '[data-action="model"]',
  );
  if (showModel !== null) showModel.disabled = state.draft.trim().length === 0;
});
view.addEventListener("click", async (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (button === null || button.disabled || busy) return;
  if (button.dataset.example !== undefined) {
    start(button.dataset.example as ExampleKind);
    return;
  }
  const action = button.dataset.action;
  if (action === "menu") {
    menu();
    return;
  }
  if (action === "sources") {
    sources();
    return;
  }
  if (action === "dictation") {
    document.querySelector<HTMLElement>("#example-information")!.innerHTML =
      "<h2>Dictate your answer</h2><p>Tap the answer field, then use the microphone on your phone’s keyboard. You can edit the words before showing the model answer.</p>";
    dialog.showModal();
    return;
  }
  busy = true;
  try {
    const s = state!;
    if (button.dataset.choice !== undefined)
      s.selected = Number(button.dataset.choice);
    else if (button.dataset.rating !== undefined) {
      if (!s.seen.includes(s.currentId)) s.seen.push(s.currentId);
      if (button.dataset.rating === "again") {
        s.recalled = s.recalled.filter((id) => id !== s.currentId);
        if (!stepBack()) advance();
      } else {
        if (!s.recalled.includes(s.currentId)) s.recalled.push(s.currentId);
        advance();
      }
    } else if (action === "known") {
      await reveal(false);
      return;
    } else if (action === "unknown" || action === "repair") {
      if (!s.seen.includes(s.currentId)) s.seen.push(s.currentId);
      if (!stepBack()) {
        await reveal(true);
        return;
      }
    } else if (action === "continue") {
      if (!s.seen.includes(s.currentId)) s.seen.push(s.currentId);
      advance();
    } else if (action === "break-down") {
      s.openStage = "supports";
      stepBack();
    } else if (action === "model") s.openStage = "model";
    save();
    render();
    window.scrollTo(0, 0);
  } catch (error) {
    console.error("Question example failed", error);
    const banner = document.querySelector<HTMLElement>("#example-error")!;
    banner.hidden = false;
    banner.textContent = `The example could not continue. ${error instanceof Error ? error.message : "Return to Examples and reopen it."}`;
  } finally {
    busy = false;
    applyPendingUpdate();
  }
});
dialog.querySelector("button")!.addEventListener("click", () => dialog.close());
const saved = sessionStorage.getItem(storageKey);
if (saved !== null) state = JSON.parse(saved) as ExampleState | null;
function navigate() {
  const kind = location.hash.slice(1);
  if (state !== null && state.kind === kind) render();
  else if (examples.some((example) => example.id === kind))
    start(kind as ExampleKind);
  else menu();
}
window.addEventListener("hashchange", navigate);
navigate();
const applyPendingUpdate = automaticUpdates(
  () =>
    !busy &&
    !(
      state !== null &&
      state.currentId === root() &&
      state.openStage === "write"
    ),
);

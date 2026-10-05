import type { Question } from "../content/curriculum";

export const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
type PracticeCard = Pick<
  Question,
  "id" | "prompt" | "rubric" | "visual" | "interaction"
>;
export interface Presentation {
  revealed: boolean;
  unknown: boolean;
  selected?: number;
  openStage?: "preview" | "supports" | "write" | "model";
  draft?: string;
  openReady?: boolean;
}
function raas(revealed: boolean) {
  return `<svg class="raas-diagram" viewBox="0 0 420 350" role="img" aria-label="Renin–angiotensin pathway: angiotensin I is converted to angiotensin II at the highlighted enzyme gap; angiotensin II contributes to narrowing blood vessels and retaining sodium and water."><defs><marker id="raas-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="m0 0 8 4-8 4" fill="#87659f"/></marker></defs><g fill="none" stroke="#c6b5d3" stroke-width="3" marker-end="url(#raas-arrow)"><path d="M210 54V154"/><path d="M210 190C210 229 100 215 100 263"/><path d="M210 190C210 229 320 215 320 263"/></g><g font-family="system-ui,sans-serif" font-size="19" text-anchor="middle" fill="#523967"><text x="210" y="36">Angiotensin I</text><text x="210" y="182">Angiotensin II</text></g><rect x="163" y="88" width="94" height="44" rx="22" fill="${revealed ? "#67478b" : "#ece6f3"}" stroke="#87659f" stroke-dasharray="${revealed ? "none" : "4 4"}"/><text x="210" y="117" text-anchor="middle" font-family="system-ui,sans-serif" font-size="21" fill="${revealed ? "white" : "#67478b"}">${revealed ? "ACE" : "?"}</text><g fill="none" stroke="#87659f" stroke-width="5" stroke-linecap="round"><path d="M55 279C78 279 81 298 100 298S122 279 145 279M55 322C78 322 81 307 100 307S122 322 145 322"/><path d="M310 274C275 254 268 310 296 326C310 334 328 326 329 307C302 312 297 297 310 274Z"/></g><g fill="#bca3cb"><circle cx="348" cy="284" r="5"/><circle cx="365" cy="299" r="5"/><circle cx="350" cy="315" r="5"/></g></svg>`;
}

function visual(q: PracticeCard, revealed: boolean) {
  if (q.interaction?.type === "diagram" && q.interaction.diagramId === "raas")
    return raas(revealed);
  const image = q.visual;
  if (
    image === undefined ||
    (image.showOn === "answer" && !revealed) ||
    (image.showOn === "question" && revealed)
  )
    return "";
  return `<figure class="learning-visual"><img src="${escape(revealed ? (image.answerSrc ?? image.src) : image.src)}" alt="${escape(image.alt)}" decoding="async"></figure>`;
}
const ratings = `<button class="wrong" data-rating="again">I was wrong</button><button data-rating="hard">Hard</button><button data-rating="good">Medium</button><button data-rating="easy">Easy</button>`;
const next =
  '<button class="primary next" data-action="continue">Next</button>';
export function presentQuestion(q: PracticeCard, s: Presentation) {
  let content = "";
  let controls = "";
  let ratingControls = false;
  const interaction = q.interaction;
  if (interaction?.type === "open-answer") {
    const draft = s.draft ?? "";
    const stage = s.openStage ?? "preview";
    if (stage === "preview")
      controls =
        s.openReady === true
          ? '<button class="secondary" data-action="unknown">I don’t know</button><button class="primary" data-action="write">Answer</button>'
          : '<button class="primary next" data-action="break-down">Break it down</button>';
    if (stage === "write") {
      content = `<textarea class="response-input" aria-label="Your answer">${escape(draft)}</textarea><button class="dictation-help" data-action="dictation">Dictate</button>`;
      controls = `<button class="primary next" data-action="model" ${draft.trim().length === 0 ? "disabled" : ""}>Show model answer</button>`;
    }
    if (stage === "model") {
      content = `${draft.trim().length > 0 ? `<textarea class="response-input" aria-label="Your answer" readonly>${escape(draft)}</textarea>` : ""}<div id="model-answer" class="answer" tabindex="-1"><h2>Model answer</h2><ol class="model-points">${q.rubric.map((line) => `<li>${escape(line)}</li>`).join("")}</ol></div>${visual(q, true)}`;
      controls = s.unknown ? next : ratings;
      ratingControls = !s.unknown;
    } else content += visual(q, false);
  } else if (
    interaction?.type === "multiple-choice" ||
    interaction?.type === "true-false"
  ) {
    content = `<div class="choice-list">${interaction.choices.map((choice, i) => `<button data-choice="${i}" ${s.selected !== undefined ? "disabled" : ""} class="${s.selected === i ? (i === interaction.correctChoice ? "selected-correct" : "selected-wrong") : ""}">${escape(choice)}</button>`).join("")}</div>`;
    if (s.unknown && s.revealed && s.selected === undefined) {
      content = `${visual(q, true)}<div id="question-answer" class="answer">${q.rubric.map((line) => `<p>${escape(line)}</p>`).join("")}</div>`;
      controls = next;
    } else if (s.selected === undefined) {
      content += visual(q, false);
      controls =
        '<button class="secondary next" data-action="unknown">I don’t know</button>';
    } else if (s.selected === interaction.correctChoice) {
      content += `<p class="choice-result" role="status">Correct</p>${visual(q, true)}<div id="question-answer" class="answer">${q.rubric.map((line) => `<p>${escape(line)}</p>`).join("")}</div>`;
      controls = next;
    } else {
      content += `<p class="choice-result" role="status">${escape(interaction.incorrectExplanations[s.selected])}</p>`;
      controls =
        '<button class="primary next" data-action="repair">Continue</button>';
    }
  } else {
    content = visual(q, s.revealed);
    if (s.revealed)
      content += `<div id="question-answer" class="answer" tabindex="-1">${q.rubric.map((line) => `<p>${escape(line)}</p>`).join("")}</div>`;
    controls = s.revealed
      ? s.unknown
        ? next
        : ratings
      : '<button class="secondary" data-action="unknown">I don’t know</button><button class="primary" data-action="known">I know</button>';
    ratingControls = s.revealed && !s.unknown;
  }
  return {
    content,
    controls,
    ratingControls,
    openModel: interaction?.type === "open-answer" && s.openStage === "model",
  };
}

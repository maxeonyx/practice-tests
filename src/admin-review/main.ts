import "./style.css";
import { automaticUpdates } from "../persistence/updates";
import {
  clusters,
  clusterById,
  concepts,
  fullReferences,
  icExamples,
  ledger,
  mappedIdChecks,
  ordinaryQuestions,
  recordById,
  referenceById,
  sourceById,
  units,
  type ReviewRecord,
  type ScopeRow,
} from "./data";

automaticUpdates(() => true);

const rootNode = document.querySelector<HTMLElement>("#review-app");
if (rootNode === null)
  throw new Error("Curriculum review page is missing #review-app.");
const root: HTMLElement = rootNode;

type View = "breadth" | "depth" | "quality" | "archive";
type Group = "course" | "objectives" | "drugs";
type ScopeItem = {
  id: string;
  course: string;
  group: Group;
  category: string;
  title: string;
  detail: string;
  status: string;
  confidence: string;
  source?: { file?: string; location?: string };
  quote?: string;
  questionIds: string[];
  referenceIds: string[];
};
const state: {
  view: View;
  group: Group;
  course: string;
  coverage: string;
  search: string;
  selectedScope: string;
  selectedRecord: string;
  archiveCourse: string;
  archiveCategory: string;
  archiveSearch: string;
  archiveLimit: number;
  scopeLimit: number;
  qualityLimit: number;
  depthLimit: number;
  depthSearch: string;
  depthCourse: string;
} = {
  view: "breadth",
  group: "course",
  course: "all",
  coverage: "all",
  search: "",
  selectedScope: "a5-outcome-1",
  selectedRecord: "medicine-teach-back",
  archiveCourse: "all",
  archiveCategory: "all",
  archiveSearch: "",
  archiveLimit: 40,
  scopeLimit: 60,
  qualityLimit: 50,
  depthLimit: 80,
  depthSearch: "",
  depthCourse: "all",
};

const esc = (value: unknown): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
const pretty = (value: string) =>
  value.replaceAll("_", " ").replaceAll(";", " · ");
const courseName = (course: string | undefined) =>
  course === "integrated-care"
    ? "Integrated Care"
    : course === "pharmacology"
      ? "Pharmacology"
      : "Cross-course";
const allQuestions = [...ordinaryQuestions, ...fullReferences];
const questionById = recordById;
const referenceIds = new Set(referenceById.keys());
const icTaskFamilies =
  ledger.integrated_care_exam_preparation_model.task_families;
const allScopes = buildScopeItems();
const archive = ledger.archive_file_inventory;
const archiveRecords = archive.records;
const archiveByPath = new Map(
  archiveRecords.map((record) => [record.path, record]),
);
const sourceOriginById = new Map<
  string,
  { url?: string; linkedFrom?: string[] }
>();
for (const source of sourceById.values()) {
  const inventory = archiveByPath.get(source.file);
  const origin = inventory?.stream_origins?.find((item) => item.url);
  sourceOriginById.set(source.id, {
    url: source.url ?? origin?.url,
    linkedFrom: origin?.linkedFrom,
  });
}

function buildScopeItems(): ScopeItem[] {
  const items: ScopeItem[] = [];
  for (const row of ledger.rows) {
    items.push({
      id: row.id,
      course: row.course,
      group: "course",
      category: row.scope_kind ?? row.scope_level ?? "course context",
      title: row.required_knowledge ?? row.id,
      detail: row.unmet_or_uncertain ?? row.unmet_or_uncertain_reason ?? "",
      status: row.coverage_status ?? "scope mapping requires review",
      confidence: row.scope_confidence ?? row.scope_level ?? "not labelled",
      source: row.source,
      quote: row.source_quote,
      questionIds: unique([
        ...(row.direct_candidate_question_ids ?? []),
        ...(row.candidate_question_ids ?? []),
        ...(row.supporting_question_ids ?? []),
        ...(row.full_answer_supporting_card_ids ?? []),
        ...(row.full_answer_ordinary_question_ids ?? []),
      ]),
      referenceIds: unique(row.full_answer_reference_ids ?? []),
    });
  }
  for (const row of ledger.pharmacology_objectives.rows) {
    items.push({
      id: `objective-${row.objective_id}`,
      course: "pharmacology",
      group: "objectives",
      category: `Guide objective · section ${row.section}`,
      title: `${row.objective_id} · ${row.required_knowledge}`,
      detail: row.facet_review_note ?? row.mapping_status,
      status: row.mapping_status,
      confidence: row.expected_depth,
      source: {
        file: "Pharmacology Study Guide 2026.pdf",
        location: `p. ${row.objective_source_page}`,
      },
      quote: row.required_knowledge,
      questionIds: unique([
        ...row.candidate_question_ids,
        ...row.ordinary_candidate_question_ids,
      ]),
      referenceIds: unique(row.full_answer_reference_ids ?? []),
    });
  }
  for (const row of ledger.pharmacology_drug_inventory.rows) {
    items.push({
      id: row.id,
      course: "pharmacology",
      group: "drugs",
      category: `Named drug/list item · section ${row.section}`,
      title: row.drug_or_entry,
      detail: row.facet_review_note ?? row.required_depth,
      status: row.facet_review_status ?? row.coverage_status,
      confidence: row.source_kind,
      source: {
        file: "Pharmacology Study Guide 2026.pdf",
        location: `p. ${row.source_page}`,
      },
      quote: row.required_depth,
      questionIds: unique([
        ...(row.candidate_question_ids ?? []),
        ...(row.ordinary_candidate_question_ids ?? []),
      ]),
      referenceIds: unique(row.full_answer_reference_ids ?? []),
    });
  }
  return items;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function statusTone(status: string) {
  return /unresolved|missing|absent|incomplete|partial|pending|not_demonstrated|need.*review|open|gap|uncertain|conflict|remain|not.*established/i.test(
    status,
  )
    ? "caution"
    : "mapped";
}

function scopeTone(item: { status: string; detail: string }) {
  return statusTone(`${item.status} ${item.detail}`);
}

function pageHeader() {
  const count = allQuestions.length;
  return `<header class="review-header"><a href="/" class="back-link">← Learner view</a><div><p class="eyebrow">READ-ONLY CONTENT REVIEW</p><h1>Curriculum evidence</h1><p>Trace scope into current questions, supporting cards and sources.</p></div><div class="live-count"><strong>${count}</strong><span>current question records</span></div></header>`;
}

function tabs() {
  const labels: [View, string][] = [
    ["breadth", "Breadth"],
    ["depth", "Depth"],
    ["quality", "Quality & accuracy"],
    ["archive", "Archive inventory"],
  ];
  return `<nav class="review-tabs" aria-label="Review dimensions">${labels
    .map(
      ([view, label]) =>
        `<button type="button" data-view="${view}" aria-current="${state.view === view ? "page" : "false"}">${label}</button>`,
    )
    .join("")}</nav>`;
}

function sourceLink(sourceId: string) {
  const source = sourceById.get(sourceId);
  const origin = sourceOriginById.get(sourceId);
  if (source === undefined)
    return `<span class="missing-link">Source ${esc(sourceId)} is absent from current data.</span>`;
  const sourceClass =
    source.collection === "supplementary" || source.kind === "web"
      ? "supplementary"
      : "archive";
  return `<article class="source-item ${sourceClass}"><div class="source-heading"><strong>${esc(source.title)}</strong><span>${sourceClass === "supplementary" ? "Supplementary" : "Supplied archive"}</span></div><p class="source-file">${esc(source.file)} · SHA-256 ${esc(source.sha256)}</p>${source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">Open source ↗</a>` : origin?.url ? `<a href="${esc(origin.url)}" target="_blank" rel="noreferrer">Open original Stream resource ↗</a>` : `<span class="no-url">Original captured resource; no direct URL was recovered.</span>`}${origin?.linkedFrom?.length ? `<small>Linked from ${esc(origin.linkedFrom.join(" · "))}</small>` : ""}</article>`;
}

function citationList(citations: any[] | undefined) {
  if (citations === undefined || citations.length === 0)
    return `<p class="empty-note">No source citations are attached to this record.</p>`;
  return `<div class="citations">${citations
    .map((citation) => {
      const source = sourceById.get(citation.sourceId);
      const location =
        citation.section ??
        (citation.page === undefined
          ? "Location not supplied"
          : `p. ${citation.page}`);
      return `<article><div class="citation-title"><strong>${esc(source?.title ?? citation.sourceId)}</strong><span>${esc(location)}</span></div><p>${esc(citation.excerpt)}</p>${sourceLink(citation.sourceId)}</article>`;
    })
    .join("")}</div>`;
}

function itemKind(record: ReviewRecord) {
  if (referenceIds.has(record.id)) return "Full-answer reference";
  if (record.kind === "constructed") return "Application question";
  return "Supporting question";
}

function recordButton(id: string, label?: string) {
  const record = questionById.get(id);
  if (record === undefined)
    return `<div class="broken-record"><strong>${esc(id)}</strong><span>Linked record is missing from the current curriculum data.</span></div>`;
  return `<button type="button" class="record-link" data-record="${esc(id)}"><span class="record-kind">${itemKind(record)}</span><strong>${esc(label ?? record.prompt)}</strong><span>${courseName(record.courseId)} · ${esc(record.id)}</span></button>`;
}

function scopeControls() {
  const counts = {
    course: allScopes.filter((item) => item.group === "course").length,
    objectives: allScopes.filter((item) => item.group === "objectives").length,
    drugs: allScopes.filter((item) => item.group === "drugs").length,
  };
  return `<div class="subtabs" role="group" aria-label="Scope source category">${(
    ["course", "objectives", "drugs"] as Group[]
  )
    .map((group) => {
      const label =
        group === "course"
          ? "A5, weeks & labs"
          : group === "objectives"
            ? "Pharmacology objectives"
            : "Named drugs";
      return `<button type="button" data-group="${group}" aria-pressed="${state.group === group}">${label}<span>${counts[group]}</span></button>`;
    })
    .join(
      "",
    )}</div><div class="filter-row"><label>Search scope<input id="scope-search" type="search" value="${esc(state.search)}" placeholder="Outcome, lab, objective, drug…"></label><label>Course<select id="scope-course"><option value="all">All courses</option><option value="integrated-care" ${state.course === "integrated-care" ? "selected" : ""}>Integrated Care</option><option value="pharmacology" ${state.course === "pharmacology" ? "selected" : ""}>Pharmacology</option></select></label><label>Review status<select id="scope-coverage"><option value="all">All statuses</option><option value="open" ${state.coverage === "open" ? "selected" : ""}>Unresolved or partial</option><option value="mapped" ${state.coverage === "mapped" ? "selected" : ""}>Candidate mapped</option></select></label></div>`;
}

function visibleScopeItems() {
  const query = state.search.trim().toLowerCase();
  return allScopes.filter((item) => {
    if (item.group !== state.group) return false;
    if (state.course !== "all" && item.course !== state.course) return false;
    if (state.coverage === "open" && scopeTone(item) !== "caution")
      return false;
    if (state.coverage === "mapped" && scopeTone(item) === "caution")
      return false;
    const haystack =
      `${item.id} ${item.title} ${item.category} ${item.detail} ${item.status}`.toLowerCase();
    return query.length === 0 || haystack.includes(query);
  });
}

function scopeDetail(item: ScopeItem | undefined) {
  if (item === undefined)
    return `<section class="empty-state">Select a scope row to inspect its source and linked questions.</section>`;
  const itemQuestions = item.questionIds
    .map((id: string) => questionById.get(id))
    .filter(Boolean) as ReviewRecord[];
  const direct = itemQuestions.filter(
    (record) => !referenceIds.has(record.id) && record.kind === "constructed",
  );
  const support = itemQuestions.filter(
    (record) => !referenceIds.has(record.id) && record.kind !== "constructed",
  );
  const missing = item.questionIds.filter(
    (id: string) => !questionById.has(id),
  );
  const references = item.referenceIds
    .map((id: string) => questionById.get(id))
    .filter(Boolean) as ReviewRecord[];
  const missingRefs = item.referenceIds.filter(
    (id: string) => !questionById.has(id),
  );
  return `<section class="scope-detail"><div class="detail-title"><div><p class="eyebrow">${esc(item.category)}</p><h2>${esc(item.title)}</h2><span class="course-pill">${courseName(item.course)}</span></div><span class="status-pill ${scopeTone(item)}">${esc(pretty(item.status))}</span></div><dl class="scope-meta"><div><dt>Scope confidence</dt><dd>${esc(pretty(item.confidence))}</dd></div><div><dt>Source location</dt><dd>${esc(item.source?.file ?? "Source not recorded")}${item.source?.location ? ` · ${esc(item.source.location)}` : ""}</dd></div></dl>${item.quote ? `<blockquote>${esc(item.quote)}</blockquote>` : ""}${item.detail ? `<p class="uncertainty"><strong>Uncertainty / review note</strong>${esc(item.detail)}</p>` : ""}<div class="linked-groups"><section><h3>Application questions <span>${direct.length}</span></h3>${direct.length === 0 ? `<p class="empty-note">No direct application question is mapped here.</p>` : direct.map((record) => recordButton(record.id)).join("")}</section><section><h3>Supporting questions <span>${support.length}</span></h3>${support.length === 0 ? `<p class="empty-note">No supporting-card mapping is recorded.</p>` : support.map((record) => recordButton(record.id)).join("")}</section><section><h3>Full-answer references <span>${references.length}</span></h3>${references.length === 0 ? `<p class="empty-note">No longer-answer reference is linked to this row.</p>` : references.map((record) => recordButton(record.id)).join("")}</section></div>${missing.length + missingRefs.length > 0 ? `<aside class="mapping-warning"><strong>Broken mappings in the current content</strong><p>${[...missing, ...missingRefs].map(esc).join(" · ")}</p></aside>` : ""}</section>`;
}

function breadthView() {
  const visible = visibleScopeItems();
  let selected = visible.find((item) => item.id === state.selectedScope);
  if (selected === undefined) selected = visible[0];
  const rows = visible.slice(0, state.scopeLimit);
  return `<section class="view-intro"><p class="eyebrow">BREADTH</p><h2>What the available sources make relevant</h2><p>Assessment instructions define some scope directly. Course objectives, weeks and lab listings define taught knowledge; where they do not name the final assessment, the link stays labelled as an inference.</p></section><div class="evidence-strip"><article><strong>${esc(ledger.archive_file_inventory.file_count)}</strong><span>archive files classified</span></article><article><strong>${esc(ledger.pharmacology_objectives.row_count)}</strong><span>Pharmacology guide objectives</span></article><article><strong>${esc(ledger.pharmacology_drug_inventory.row_count)}</strong><span>named drug/list rows</span></article><article><strong>${esc((ledger.rows as any[]).filter((row) => row.course === "integrated-care").length)}</strong><span>Integrated Care scope rows</span></article></div><section class="assessment-model"><h3>Confirmed assessment facts</h3>${(
    ledger.assessment_scope_argument.confirmed_assessment_model as any[]
  )
    .map(
      (model) =>
        `<article><strong>${courseName(model.course)} · ${esc(model.evidence)}</strong><p>${esc(model.confirmed)}</p>${model.source_quote ? `<blockquote>${esc(model.source_quote)}</blockquote>` : ""}<small>${esc(model.source_location ?? model.source ?? "")}</small></article>`,
    )
    .join(
      "",
    )}<p class="limit-note">${esc((ledger.integrated_care_exam_preparation_model.confirmed_assessment_statement as any).limitations ?? "No topic or question-type probabilities are available.")}</p></section><section class="scope-browser"><div class="scope-browser-head"><div><p class="eyebrow">SCOPE-TO-CONTENT MAP</p><h3>Inspect each requirement</h3></div><p class="review-caveat">A linked card shows a candidate mapping. It does not by itself prove every required facet is learnable.</p></div>${scopeControls()}<div class="scope-layout"><div class="scope-results"><p class="result-count">Showing ${Math.min(rows.length, visible.length)} of ${visible.length} rows</p>${rows.length === 0 ? `<p class="empty-state">No scope rows match these filters.</p>` : rows.map((item) => `<button type="button" class="scope-row ${item.id === selected?.id ? "selected" : ""}" data-scope="${esc(item.id)}"><span class="scope-row-top"><span>${courseName(item.course)}</span><span class="status-dot ${scopeTone(item)}">${scopeTone(item) === "caution" ? "Review open" : "Mapped"}</span></span><strong>${esc(item.title)}</strong><small>${esc(item.category)} · ${item.questionIds.length} linked cards · ${item.referenceIds.length} full answers</small></button>`).join("")}${visible.length > rows.length ? `<button type="button" class="load-more" data-scope-more>Show the next ${Math.min(60, visible.length - rows.length)} scope rows</button>` : ""}</div>${scopeDetail(selected)}</div></section><section class="scope-rules"><h3>How scope is classified</h3><div class="rule-grid">${(ledger.assessment_scope_argument.proposed_scope_rules as any[]).map((rule) => `<article><span class="status-pill ${rule.scope === "confirmed" ? "mapped" : "caution"}">${esc(pretty(rule.scope))}</span><p>${esc(rule.rule)}</p></article>`).join("")}</div>${(ledger.assessment_scope_argument.residual_scope_uncertainties as string[]).map((note) => `<p class="uncertainty">${esc(note)}</p>`).join("")}</section>`;
}

function referenceSteps(record: ReviewRecord) {
  const reference = referenceById.get(record.id) as any;
  const steps = reference?.answerStepCardMap ?? record.answerStepCardMap;
  if (steps === undefined || steps.length === 0) return "";
  return `<section class="answer-steps"><h3>Answer steps linked to teaching</h3><ol>${steps
    .map(
      (step: any, index: number) =>
        `<li><strong>${esc(typeof step.rubricStep === "number" ? `Answer point ${step.rubricStep}` : step.rubricStep)}</strong><p>${esc(step.mappingBasis ?? "Mapped support cards")}</p>${(step.supportingQuestionIds ?? []).map((id: string) => recordButton(id)).join("")}</li>`,
    )
    .join("")}</ol></section>`;
}

function prerequisiteChain(record: ReviewRecord) {
  const visited = new Set<string>();
  const order: ReviewRecord[] = [];
  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const linked = questionById.get(id);
    if (linked === undefined) return;
    for (const child of linked.prerequisiteQuestionIds ?? []) visit(child);
    if (id !== record.id) order.push(linked);
  }
  for (const id of record.prerequisiteQuestionIds ?? []) visit(id);
  return order;
}

const scopesByQuestionId = new Map<string, ScopeItem[]>();
for (const scope of allScopes) {
  for (const id of [...scope.questionIds, ...scope.referenceIds]) {
    const scopes = scopesByQuestionId.get(id) ?? [];
    scopes.push(scope);
    scopesByQuestionId.set(id, scopes);
  }
}

function referenceUsesQuestion(referenceId: string, targetId: string) {
  const reference = referenceById.get(referenceId);
  if (reference === undefined) return false;
  const roots = unique([
    reference.questionId,
    ...(reference.sourceQuestionId ? [reference.sourceQuestionId] : []),
    ...(reference.sourceQuestionIds ?? []),
  ]);
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visited.has(id)) return false;
    visited.add(id);
    if (id === targetId) return true;
    const question = questionById.get(id);
    return (question?.prerequisiteQuestionIds ?? []).some(visit);
  };
  const supportsInAnswerSteps = (reference.answerStepCardMap ?? []).some(
    (step) => step.supportingQuestionIds.includes(targetId),
  );
  return supportsInAnswerSteps || roots.some(visit);
}

function recordDetail(id: string) {
  const record = questionById.get(id);
  if (record === undefined)
    return `<aside class="review-panel"><h3>Record unavailable</h3><p>The requested ID does not resolve in current content: <code>${esc(id)}</code></p></aside>`;
  const isReference = referenceIds.has(id);
  const prereqs = prerequisiteChain(record);
  const cluster = clusterById.get(record.clusterId);
  const linkedRefs = fullReferences.filter((reference) =>
    referenceUsesQuestion(reference.id, id),
  );
  const linkedScopes = scopesByQuestionId.get(id) ?? [];
  const visual = record.visual;
  const citedSources = citationList(record.sources);
  const scopeEvidence = linkedScopes
    .map(
      (scope) =>
        `<article class="scope-evidence"><p class="eyebrow">${esc(scope.category)} · ${esc(pretty(scope.status))}</p><h4>${esc(scope.title)}</h4><p>${esc(scope.source?.file ?? "Source location not recorded")}${scope.source?.location ? ` · ${esc(scope.source.location)}` : ""}</p>${scope.quote ? `<blockquote>${esc(scope.quote)}</blockquote>` : ""}${scope.detail ? `<p class="uncertainty">${esc(scope.detail)}</p>` : ""}</article>`,
    )
    .join("");
  const clusterContext = cluster
    ? `<details class="cluster-context"><summary>Cluster context · ${esc(cluster.title)}</summary>${cluster.diagram ? `<p>${esc(cluster.diagram.central)}</p><div class="cluster-nodes">${cluster.diagram.nodes.map((node) => `<span>${esc(node.label)}</span>`).join("")}</div>` : `<p>No cluster diagram is attached.</p>`}${cluster.image ? `<figure class="review-visual"><img src="${esc(cluster.image.src)}" alt="${esc(cluster.image.alt)}" loading="lazy"><figcaption>${esc(cluster.image.caption)}</figcaption></figure>` : ""}</details>`
    : "";
  return `<article class="record-detail"><div class="record-detail-head"><div><p class="eyebrow">${courseName(record.courseId)} · ${itemKind(record)}</p><h2>${esc(record.title ?? record.prompt)}</h2><code>${esc(record.id)}</code></div><div class="item-badges"><span>${esc(record.kind)}</span>${record.interaction ? `<span>${esc(record.interaction.type)}</span>` : ""}</div></div><div class="question-prompt"><strong>Prompt</strong><p>${esc(record.prompt)}</p></div>${visual ? `<figure class="review-visual"><img src="${esc(visual.src)}" alt="${esc(visual.alt)}" loading="lazy"><figcaption>${esc(visual.alt)}${visual.showOn ? ` · shown on ${esc(visual.showOn)}` : ""}</figcaption></figure>` : ""}${visual?.answerSrc ? `<figure class="review-visual"><img src="${esc(visual.answerSrc)}" alt="Answer visual for ${esc(record.prompt)}" loading="lazy"><figcaption>Answer visual</figcaption></figure>` : ""}<section class="answer-box"><h3>${isReference ? "Full answer / marking points" : "Answer"}</h3>${record.rubric.length === 1 ? `<p>${esc(record.rubric[0])}</p>` : `<ol>${record.rubric.map((point) => `<li>${esc(point)}</li>`).join("")}</ol>`}</section>${referenceSteps(record)}<section class="detail-section"><h3>Source evidence</h3>${citedSources}</section><section class="detail-section"><h3>Scope and assessment evidence <span>${linkedScopes.length}</span></h3>${scopeEvidence || `<p class="empty-note">No scope-ledger row directly maps this card.</p>`}</section><section class="detail-section"><h3>Prerequisite questions <span>${prereqs.length}</span></h3>${prereqs.length === 0 ? `<p class="empty-note">No prerequisite questions are linked.</p>` : `<div class="record-list">${prereqs.map((item) => recordButton(item.id)).join("")}</div>`}</section>${linkedRefs.length > 0 ? `<section class="detail-section"><h3>Full-answer tasks using this card or its prerequisite chain <span>${linkedRefs.length}</span></h3>${linkedRefs.map((reference) => recordButton(reference.id)).join("")}</section>` : ""}${clusterContext}<p class="review-disclaimer">This view shows authored content and its evidence chain. It does not certify the answer or imply a topic’s exam weighting.</p></article>`;
}

function depthView() {
  const taskFamilies = icTaskFamilies
    .map(
      (family) =>
        `<article class="family-card"><p class="eyebrow">${esc(pretty(family.format_relation))}</p><h3>${esc(pretty(family.id))}</h3><p>${esc(family.scope_basis)}</p><div class="record-list">${unique(
          [
            ...(family.example_question_ids ?? []),
            ...(family.supporting_question_ids ?? []),
            ...(family.full_answer_reference_ids ?? []),
          ],
        )
          .map((id: string) => recordButton(id))
          .join(
            "",
          )}</div><details><summary>Source and transfer basis</summary><p>${(family.source_ids ?? []).map((id: string) => esc(sourceById.get(id)?.title ?? id)).join(" · ")}</p></details></article>`,
    )
    .join("");
  const examples = (icExamples as any[])
    .map(
      (example) =>
        `<article class="example-card"><div class="example-meta"><span>${esc(pretty(example.taskFormat))}</span><span>${esc(pretty(example.cognitiveTask))}</span></div><h3>${esc(example.prompt)}</h3>${example.options?.length ? `<ol class="example-options">${example.options.map((option: any) => `<li>${esc(typeof option === "string" ? option : option.text)}</li>`).join("")}</ol>` : ""}<details class="example-answer"><summary>Show answer and reasoning</summary><p class="answer-text"><strong>${esc(example.answerText ?? example.answer)}</strong></p><p>${esc(example.explanation)}</p>${example.howCardsSupportTransfer ? `<p><strong>How the cards support transfer:</strong> ${esc(example.howCardsSupportTransfer)}</p>` : ""}<div class="source-example">${(example.sources ?? []).map((source: any) => `<blockquote><strong>${esc(source.sourceTitle ?? source.sourceId)}</strong>${source.location ? ` · ${esc(source.location)}` : ""}<p>${esc(source.quote)}</p></blockquote>`).join("")}</div><h4>Current ordinary cards</h4><div class="record-list">${(example.ordinaryCardIds ?? []).map((id: string) => recordButton(id)).join("")}</div><h4>Long-answer references</h4><div class="record-list">${(example.fullReferenceIDs ?? []).map((id: string) => recordButton(id)).join("")}</div></details></article>`,
    )
    .join("");
  const search = state.depthSearch.trim().toLowerCase();
  const pharmRefs = fullReferences
    .filter((record) => record.courseId === "pharmacology")
    .filter(
      (record) =>
        state.depthCourse === "all" || state.depthCourse === record.courseId,
    )
    .filter(
      (record) =>
        search.length === 0 ||
        `${record.id} ${record.prompt} ${record.rubric.join(" ")}`
          .toLowerCase()
          .includes(search),
    );
  const visibleReferences = pharmRefs.slice(0, state.depthLimit);
  return `<section class="view-intro"><p class="eyebrow">DEPTH</p><h2>From exam task to learnable parts</h2><p>Open a task, then trace its answer into ordinary cards, full-answer points and cited sources. Every Integrated Care example below is illustrative; the A5 source confirms formats, not topic frequencies.</p></section><section class="assessment-model compact"><h3>What the assessment source confirms</h3>${(ledger.integrated_care_exam_preparation_model.confirmed_assessment_statement as any).exact_quote ? `<blockquote>${esc((ledger.integrated_care_exam_preparation_model.confirmed_assessment_statement as any).exact_quote)}</blockquote>` : ""}<p>${esc((ledger.integrated_care_exam_preparation_model.confirmed_assessment_statement as any).limitations)}</p><p class="limit-note">${esc((ledger.integrated_care_exam_preparation_model.no_forecast as string) ?? "No likelihood or percentage forecast is supported.")}</p></section><div class="depth-layout"><section><h3>Six illustrative task examples</h3><div class="example-list">${examples}</div><h3>How preparation transfers</h3><p>${esc(ledger.integrated_care_exam_preparation_model.preparation_logic)}</p></section><aside class="depth-side"><h3>Task families in the scope argument</h3>${taskFamilies}<h3>Pharmacology full-answer references</h3><label class="filter-inline">Search references<input id="depth-search" type="search" value="${esc(state.depthSearch)}" placeholder="Drug, task, outcome…"></label><p class="result-count">Showing ${visibleReferences.length} of ${pharmRefs.length} matching current references</p><div class="record-list">${visibleReferences.map((record) => recordButton(record.id)).join("")}</div>${pharmRefs.length > visibleReferences.length ? `<button type="button" class="load-more" data-depth-more>Show the next ${Math.min(80, pharmRefs.length - visibleReferences.length)} references</button>` : ""}</aside></div>`;
}

function qualityView() {
  const selected =
    questionById.get(state.selectedRecord) ??
    questionById.get("medicine-teach-back") ??
    allQuestions[0];
  const dimensionOrder = ["breadth", "depth", "quality", "accuracy"];
  const dimensions = ledger.completion_dimensions as Record<string, any>;
  const summaries = dimensionOrder
    .map((key) => {
      const dimension = dimensions[key];
      return `<article class="dimension-card"><p class="eyebrow">${esc(key)}</p><h3>${esc(pretty(dimension.status))}</h3><p>${esc(dimension.evidence)}</p><details><summary>Current review gaps</summary><ul>${dimension.current_gaps.map((gap: string) => `<li>${esc(gap)}</li>`).join("")}</ul></details></article>`;
    })
    .join("");
  const visualCount = allQuestions.filter(
    (record) => record.visual !== undefined,
  ).length;
  const query = state.search.trim().toLowerCase();
  const allMatches = allQuestions
    .filter(
      (record) => state.course === "all" || record.courseId === state.course,
    )
    .filter(
      (record) =>
        query.length === 0 ||
        `${record.id} ${record.prompt} ${record.rubric.join(" ")}`
          .toLowerCase()
          .includes(query),
    );
  const visibleRecords = allMatches.slice(0, state.qualityLimit);
  return `<section class="view-intro"><p class="eyebrow">QUALITY & ACCURACY</p><h2>Inspect actual cards and their evidence</h2><p>The ledger records what has and has not been reviewed. Choose any current question to inspect its answer, visual, source citations and prerequisite chain.</p></section><div class="dimensions">${summaries}<article class="dimension-card visual-coverage"><p class="eyebrow">Learner visuals</p><h3>${visualCount} / ${allQuestions.length} cards have a visual</h3><p>Attachment count does not establish that a visual teaches or grounds the subject. Grounding review remains open.</p></article></div><section class="record-explorer"><div class="filter-row"><label>Find a current card<input id="quality-search" type="search" value="${esc(state.search)}" placeholder="Search prompt, answer or ID…"></label><label>Course<select id="quality-course"><option value="all">All courses</option><option value="integrated-care" ${state.course === "integrated-care" ? "selected" : ""}>Integrated Care</option><option value="pharmacology" ${state.course === "pharmacology" ? "selected" : ""}>Pharmacology</option></select></label></div><div class="record-explorer-layout"><div class="record-results"><p class="result-count">Showing ${visibleRecords.length} of ${allMatches.length} current records</p>${visibleRecords.map((record) => recordButton(record.id)).join("")}${allMatches.length > visibleRecords.length ? `<button type="button" class="load-more" data-quality-more>Show the next ${Math.min(50, allMatches.length - visibleRecords.length)} cards</button>` : ""}</div><div id="selected-record">${recordDetail(selected?.id ?? "")}</div></div></section>`;
}

function archiveView() {
  const search = state.archiveSearch.trim().toLowerCase();
  const categories = Object.keys(archive.category_counts as object).sort();
  const records = archiveRecords
    .filter(
      (record) =>
        state.archiveCourse === "all" ||
        record.course === state.archiveCourse ||
        (state.archiveCourse === "cross-course-or-unresolved" &&
          record.course === state.archiveCourse),
    )
    .filter(
      (record) =>
        state.archiveCategory === "all" ||
        record.content_category === state.archiveCategory,
    )
    .filter(
      (record) =>
        search.length === 0 ||
        `${record.display_name} ${record.archive_reason} ${record.content_category} ${record.assessment_relevance} ${record.potential_usefulness}`
          .toLowerCase()
          .includes(search),
    );
  const page = records.slice(0, state.archiveLimit);
  return `<section class="view-intro"><p class="eyebrow">SOURCE BREADTH</p><h2>The archive, classified</h2><p>Each manifest file is classified by content and assessment relevance. File presence helps describe available course material; it is not proof that a topic is on the exam.</p></section><div class="evidence-strip"><article><strong>${esc(archive.file_count)}</strong><span>manifest files</span></article><article><strong>${esc(archive.hash_verified_manifest_entries)}</strong><span>hash verified</span></article><article><strong>${esc(archive.origin_recovered_count)}</strong><span>Stream origins recovered</span></article><article><strong>${esc(archive.origin_missing_count)}</strong><span>origin unavailable</span></article></div><p class="review-caveat">${esc(archive.classification_method)}</p><div class="archive-toolbar"><label>Search inventory<input id="archive-search" type="search" value="${esc(state.archiveSearch)}" placeholder="Filename, source type, scope…"></label><label>Course<select id="archive-course"><option value="all">All courses</option><option value="integrated-care" ${state.archiveCourse === "integrated-care" ? "selected" : ""}>Integrated Care</option><option value="pharmacology" ${state.archiveCourse === "pharmacology" ? "selected" : ""}>Pharmacology</option><option value="cross-course-or-unresolved" ${state.archiveCourse === "cross-course-or-unresolved" ? "selected" : ""}>Cross-course / unresolved</option></select></label><label>Content category<select id="archive-category"><option value="all">All ${categories.length} categories</option>${categories.map((category) => `<option value="${esc(category)}" ${state.archiveCategory === category ? "selected" : ""}>${esc(pretty(category))} · ${(archive.category_counts as any)[category]}</option>`).join("")}</select></label></div><div class="category-strip">${categories.map((category) => `<button type="button" data-archive-category="${esc(category)}" aria-pressed="${state.archiveCategory === category}">${esc(pretty(category))}<strong>${(archive.category_counts as any)[category]}</strong></button>`).join("")}</div><p class="result-count">Showing ${page.length} of ${records.length} matching files</p><div class="archive-list">${page.map((record) => `<details class="archive-record"><summary><span class="archive-course">${courseName(record.course)}</span><strong>${esc(record.display_name)}</strong><span>${esc(pretty(record.content_category))}</span></summary><div class="archive-detail"><dl><div><dt>Archive reason</dt><dd>${esc(record.archive_reason)}</dd></div><div><dt>Assessment relevance</dt><dd>${esc(pretty(record.assessment_relevance))}</dd></div><div><dt>Classification basis</dt><dd>${esc(record.scope_basis)}</dd></div><div><dt>Usefulness</dt><dd>${esc(record.potential_usefulness)}</dd></div></dl><p><code>${esc(record.path)}</code></p><p>SHA-256 ${esc(record.sha256)} · ${esc(record.bytes)} bytes · ${esc(record.origin_status)}</p>${record.captured_text_status === "withheld-private-quiz-capture" ? `<p class="privacy-note">Private quiz attempt text is withheld. This record is retained only to classify the available resource.</p>` : record.captured_text_synopsis ? `<details><summary>Captured text synopsis</summary><p>${esc(record.captured_text_synopsis)}</p></details>` : ""}${record.stream_origins?.map((origin: any) => `<p><a href="${esc(origin.url)}" target="_blank" rel="noreferrer">Open safe Stream origin ↗</a><small>${esc(origin.linkedFrom.join(" · "))}</small></p>`).join("")}</div></details>`).join("")}</div>${records.length > page.length ? `<button type="button" class="load-more" data-archive-more>Show the next ${Math.min(40, records.length - page.length)} files</button>` : ""}<section class="unavailable-sources"><h3>Unavailable course material</h3>${(ledger.archive_source_gaps.records as any[]).map((item) => `<article><strong>${esc(item.display_name ?? item.url)}</strong><p>${esc(item.reason ?? item.description ?? item.status ?? "This linked asset was not captured in the archive.")}</p></article>`).join("")}${(ledger.archive_source_gaps.other_unavailable_course_material as any[]).map((item) => `<article><strong>${esc(item.title ?? item.name)}</strong><p>${esc(item.reason ?? item.description ?? "Referenced by course material but not present in the captured archive.")}</p></article>`).join("")}</section>`;
}

function render() {
  const content =
    state.view === "breadth"
      ? breadthView()
      : state.view === "depth"
        ? depthView()
        : state.view === "quality"
          ? qualityView()
          : archiveView();
  root.innerHTML = `${pageHeader()}${tabs()}<main class="review-main"><div class="runtime-integrity ${mappedIdChecks.missingQuestions.length + mappedIdChecks.missingReferences.length > 0 ? "caution" : "mapped"}"><strong>${mappedIdChecks.missingQuestions.length + mappedIdChecks.missingReferences.length === 0 ? "Current links resolve" : "Some ledger links do not resolve"}</strong><span>${ordinaryQuestions.length} ordinary / ${fullReferences.length} full-answer records · ${mappedIdChecks.missingQuestions.length + mappedIdChecks.missingReferences.length} missing mapped IDs</span>${mappedIdChecks.missingQuestions.length + mappedIdChecks.missingReferences.length > 0 ? `<details><summary>Show unresolved IDs</summary><p>${[...mappedIdChecks.missingQuestions, ...mappedIdChecks.missingReferences].map(esc).join(" · ")}</p></details>` : ""}</div>${content}</main>`;
  bindEvents();
}

function preserveInput(input: HTMLInputElement, update: () => void) {
  state.search = input.value;
  const focusId = input.id;
  const cursor = input.selectionStart;
  update();
  const replacement = document.getElementById(
    focusId,
  ) as HTMLInputElement | null;
  replacement?.focus();
  if (replacement !== null && cursor !== null)
    replacement.setSelectionRange(cursor, cursor);
}

function bindEvents() {
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-view]"))
    button.addEventListener("click", () => {
      state.view = button.dataset.view as View;
      render();
    });
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-group]"))
    button.addEventListener("click", () => {
      state.group = button.dataset.group as Group;
      state.selectedScope = "";
      render();
    });
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-scope]"))
    button.addEventListener("click", () => {
      state.selectedScope = button.dataset.scope ?? "";
      render();
    });
  root
    .querySelector<HTMLButtonElement>("[data-scope-more]")
    ?.addEventListener("click", () => {
      state.scopeLimit += 60;
      render();
    });
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-record]",
  ))
    button.addEventListener("click", () => {
      state.selectedRecord = button.dataset.record ?? "";
      state.view = "quality";
      render();
      document
        .getElementById("selected-record")
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  root
    .querySelector<HTMLButtonElement>("[data-quality-more]")
    ?.addEventListener("click", () => {
      state.qualityLimit += 50;
      render();
    });
  root
    .querySelector<HTMLButtonElement>("[data-depth-more]")
    ?.addEventListener("click", () => {
      state.depthLimit += 80;
      render();
    });
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-archive-category]",
  ))
    button.addEventListener("click", () => {
      state.archiveCategory = button.dataset.archiveCategory ?? "all";
      state.view = "archive";
      render();
    });
  const scopeSearch = root.querySelector<HTMLInputElement>("#scope-search");
  scopeSearch?.addEventListener("input", () =>
    preserveInput(scopeSearch, render),
  );
  root
    .querySelector<HTMLSelectElement>("#scope-course")
    ?.addEventListener("change", (event) => {
      state.course = (event.target as HTMLSelectElement).value;
      render();
    });
  root
    .querySelector<HTMLSelectElement>("#scope-coverage")
    ?.addEventListener("change", (event) => {
      state.coverage = (event.target as HTMLSelectElement).value;
      render();
    });
  const qualitySearch = root.querySelector<HTMLInputElement>("#quality-search");
  qualitySearch?.addEventListener("input", () => {
    state.search = qualitySearch.value;
    const start = qualitySearch.selectionStart;
    render();
    const next = root.querySelector<HTMLInputElement>("#quality-search");
    next?.focus();
    if (next !== null && start !== null) next.setSelectionRange(start, start);
  });
  root
    .querySelector<HTMLSelectElement>("#quality-course")
    ?.addEventListener("change", (event) => {
      state.course = (event.target as HTMLSelectElement).value;
      render();
    });
  const depthSearch = root.querySelector<HTMLInputElement>("#depth-search");
  depthSearch?.addEventListener("input", () => {
    state.depthSearch = depthSearch.value;
    const start = depthSearch.selectionStart;
    render();
    const next = root.querySelector<HTMLInputElement>("#depth-search");
    next?.focus();
    if (next !== null && start !== null) next.setSelectionRange(start, start);
  });
  const archiveSearch = root.querySelector<HTMLInputElement>("#archive-search");
  archiveSearch?.addEventListener("input", () => {
    state.archiveSearch = archiveSearch.value;
    state.archiveLimit = 40;
    const start = archiveSearch.selectionStart;
    render();
    const next = root.querySelector<HTMLInputElement>("#archive-search");
    next?.focus();
    if (next !== null && start !== null) next.setSelectionRange(start, start);
  });
  root
    .querySelector<HTMLSelectElement>("#archive-course")
    ?.addEventListener("change", (event) => {
      state.archiveCourse = (event.target as HTMLSelectElement).value;
      render();
    });
  root
    .querySelector<HTMLSelectElement>("#archive-category")
    ?.addEventListener("change", (event) => {
      state.archiveCategory = (event.target as HTMLSelectElement).value;
      render();
    });
  root
    .querySelector<HTMLButtonElement>("[data-archive-more]")
    ?.addEventListener("click", () => {
      state.archiveLimit += 40;
      render();
    });
}

render();

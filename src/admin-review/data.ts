import currentCurriculumUrl from "../content/data.json?url";
import examplesUrl from "./exam-examples.json?url";
import ledgerUrl from "./scope-ledger.json?url";

export type Citation = {
  sourceId: string;
  page?: number | string;
  section?: string;
  excerpt: string;
};

export type ReviewRecord = {
  id: string;
  courseId: string;
  unitId: string;
  clusterId: string;
  kind: string;
  title?: string;
  prompt: string;
  rubric: string[];
  sources: Citation[];
  conceptIds?: string[];
  prerequisiteQuestionIds?: string[];
  interaction?: { type: string; choices?: string[] };
  answerStepCardMap?: AnswerStep[];
  visual?: {
    src: string;
    alt: string;
    showOn?: string;
    answerSrc?: string;
  };
  questionRole?: string;
  authoringKind?: string;
};

export type AnswerStep = {
  rubricStep: string | number;
  supportingQuestionIds: string[];
  mappingBasis?: string;
};

export type Source = {
  id: string;
  title: string;
  file: string;
  sha256: string;
  kind: string;
  url?: string;
  contextUrl?: string;
  collection?: string;
};

export type CurriculumCluster = {
  id: string;
  title: string;
  questionId: string;
  diagram?: {
    central: string;
    nodes: { conceptId: string; label: string }[];
  };
  image?: {
    src: string;
    alt: string;
    caption: string;
    sourceId: string;
    page: number;
  };
};

type ReferenceIndex = {
  id: string;
  questionId: string;
  sourceQuestionId?: string;
  sourceQuestionIds?: string[];
  answerStepCardMap?: AnswerStep[];
};

type LiveCurriculum = {
  units: { id: string; courseId: string; title: string; order: number }[];
  concepts: { id: string; title: string; prerequisiteIds: string[] }[];
  clusters: CurriculumCluster[];
  sources: Source[];
  questions: ReviewRecord[];
  examReferences: ReferenceIndex[];
};

export type ScopeRow = {
  id: string;
  course: string;
  scope_kind?: string;
  scope_level?: string;
  scope_confidence?: string;
  source?: { file?: string; location?: string };
  required_knowledge?: string;
  direct_candidate_question_ids?: string[];
  supporting_question_ids?: string[];
  candidate_question_ids?: string[];
  coverage_status?: string;
  unmet_or_uncertain_reason?: string;
  unmet_or_uncertain?: string;
  source_quote?: string;
  full_answer_reference_ids?: string[];
  reference_supporting_question_ids?: string[];
  full_answer_supporting_card_ids?: string[];
  full_answer_ordinary_question_ids?: string[];
  full_answer_mapping_status?: string;
};

export type PharmacologyObjective = {
  objective_id: string;
  section: string;
  objective_source_page: number;
  required_knowledge: string;
  expected_depth: string;
  candidate_question_ids: string[];
  ordinary_candidate_question_ids: string[];
  full_answer_reference_ids: string[];
  candidate_question_ids_not_found: string[];
  mapping_status: string;
  facet_review_status: string;
  facet_review_note: string;
  missing_facets_or_review_need: string;
};

export type PharmacologyDrug = {
  id: string;
  section: string;
  source_page: number;
  source_kind: string;
  drug_or_entry: string;
  aliases_checked: string[];
  required_depth: string;
  candidate_question_ids: string[];
  ordinary_candidate_question_ids: string[];
  full_answer_reference_ids: string[];
  candidate_question_ids_not_found: string[];
  required_facets_from_guide_wording: string[];
  coverage_status: string;
  source_note: string;
  facet_review_status: string;
  facet_review_note: string;
  short_session_ordinary_question_ids: string[];
  short_session_named_evidence_ids: string[];
  short_session_name_coverage: string;
  ordinary_named_question_ids_all_paths: string[];
  open_reference_path_only_named_question_ids: string[];
};

export type ArchiveRecord = {
  path: string;
  sha256: string;
  bytes: number;
  hash_verification: string;
  archive_reason: string;
  display_name: string;
  course: string;
  content_category: string;
  potential_usefulness: string;
  assessment_relevance: string;
  scope_basis: string;
  origin_status: string;
  captured_text_status?: string;
  captured_text_synopsis?: string;
  review_note?: string;
  duplicate_archive_paths?: string[];
  stream_origins: { url: string; linkedFrom: string[] }[];
};

export type ReviewLedger = {
  rows: ScopeRow[];
  pharmacology_objectives: {
    source: string;
    row_count: number;
    mapping_method: string;
    candidate_question_count: number;
    unresolved_no_candidate_objectives: {
      objective_id: string;
      required_knowledge: string;
      source_page: number;
    }[];
    rows: PharmacologyObjective[];
  };
  pharmacology_drug_inventory: {
    source: string;
    row_count: number;
    match_rule: string;
    unmatched_entries: string[];
    candidate_catalogue_question_count: number;
    named_drug_candidate_match_count: number;
    unmatched_entries_status: string;
    short_session_name_coverage_method: Record<string, string>;
    rows: PharmacologyDrug[];
  };
  archive_file_inventory: {
    manifest: string;
    file_count: number;
    hash_verified_manifest_entries: number;
    hash_unverified_or_mismatched_entries: number;
    origin_recovered_count: number;
    origin_missing_count: number;
    private_quiz_capture_synopses_withheld: number;
    source_link_policy: string;
    classification_method: string;
    category_counts: Record<string, number>;
    assessment_relevance_counts: Record<string, number>;
    course_counts: Record<string, number>;
    records: ArchiveRecord[];
    visual_asset_review?: unknown;
    residual_course_context?: unknown;
  };
  archive_source_gaps: {
    missing_linked_asset_count: number;
    records: {
      url: string;
      linked_from: string[];
      capture_result: string;
      course: string;
      content_category: string;
      usefulness_if_recovered: string;
      assessment_relevance: string;
      url_safety: string;
    }[];
    other_unavailable_course_material: {
      title?: string;
      name?: string;
      reason?: string;
      description?: string;
    }[];
  };
  assessment_scope_argument: {
    confirmed_assessment_model: {
      course: string;
      evidence: string;
      confirmed: string;
      source_quote?: string;
      source_location?: string;
      source?: string;
      limitations?: string;
    }[];
    proposed_scope_rules: { scope: string; rule: string }[];
    residual_scope_uncertainties: string[];
    available_course_content_categories?: unknown[];
  };
  integrated_care_exam_preparation_model: {
    confirmed_assessment_statement: {
      exact_quote?: string;
      limitations?: string;
    };
    preparation_logic: string;
    task_families: {
      format_relation: string;
      id: string;
      scope_basis: string;
      example_question_ids?: string[];
      supporting_question_ids?: string[];
      full_answer_reference_ids?: string[];
      source_ids?: string[];
    }[];
    no_forecast: string;
  };
  completion_dimensions: Record<
    string,
    { status: string; evidence: string; current_gaps: string[] }
  >;
};

export type ExamExample = {
  id: string;
  taskFormat: string;
  cognitiveTask: string;
  prompt: string;
  options?: (string | { text: string })[];
  answer?: string;
  answerText?: string;
  explanation: string;
  sources: {
    sourceId?: string;
    sourceTitle?: string;
    location?: string;
    quote: string;
  }[];
  ordinaryCardIds: string[];
  fullReferenceIDs: string[];
  howCardsSupportTransfer: string;
};

type FetchedReviewData = {
  curriculum: LiveCurriculum;
  ledger: ReviewLedger;
  examples: ExamExample[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Review data failed to load (${response.status}): ${url}`);
  return (await response.json()) as T;
}

const [curriculum, ledger, icExamples] = await Promise.all([
  fetchJson<LiveCurriculum>(currentCurriculumUrl),
  fetchJson<ReviewLedger>(ledgerUrl),
  fetchJson<ExamExample[]>(examplesUrl),
]);

export const units = curriculum.units;
export const concepts = curriculum.concepts;
export const clusters = curriculum.clusters;
export const sources = curriculum.sources;
export const ordinaryQuestions = curriculum.questions.filter(
  (record) =>
    !curriculum.examReferences.some((reference) => reference.id === record.id),
);
export const fullReferences = curriculum.examReferences.flatMap((reference) => {
  const record = curriculum.questions.find(
    (question) => question.id === reference.id,
  );
  return record === undefined ? [] : [{ ...record, ...reference }];
});

export const recordById = new Map(
  curriculum.questions.map((record) => [record.id, record]),
);
export const referenceById = new Map(
  curriculum.examReferences.map((reference) => [reference.id, reference]),
);
export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const clusterById = new Map(
  clusters.map((cluster) => [cluster.id, cluster]),
);

export const mappedIdChecks = (() => {
  const missingQuestions = new Set<string>();
  const missingReferences = new Set<string>();
  const checkQuestionIds = (ids: string[]) => {
    for (const id of ids) if (!recordById.has(id)) missingQuestions.add(id);
  };
  const checkReferenceIds = (ids: string[]) => {
    for (const id of ids) if (!referenceById.has(id)) missingReferences.add(id);
  };

  for (const row of ledger.rows) {
    checkQuestionIds([
      ...(row.candidate_question_ids ?? []),
      ...(row.direct_candidate_question_ids ?? []),
      ...(row.supporting_question_ids ?? []),
      ...(row.full_answer_supporting_card_ids ?? []),
      ...(row.full_answer_ordinary_question_ids ?? []),
    ]);
    checkReferenceIds(row.full_answer_reference_ids ?? []);
  }
  for (const objective of ledger.pharmacology_objectives.rows) {
    checkQuestionIds(objective.candidate_question_ids);
    checkReferenceIds(objective.full_answer_reference_ids);
  }
  for (const drug of ledger.pharmacology_drug_inventory.rows) {
    checkQuestionIds([
      ...drug.candidate_question_ids,
      ...drug.ordinary_candidate_question_ids,
      ...drug.short_session_ordinary_question_ids,
      ...drug.short_session_named_evidence_ids,
      ...drug.ordinary_named_question_ids_all_paths,
      ...drug.open_reference_path_only_named_question_ids,
    ]);
    checkReferenceIds(drug.full_answer_reference_ids);
  }
  for (const example of icExamples) {
    checkQuestionIds([...example.ordinaryCardIds, ...example.fullReferenceIDs]);
  }

  return {
    missingQuestions: [...missingQuestions].sort(),
    missingReferences: [...missingReferences].sort(),
  };
})();

export { icExamples, ledger };

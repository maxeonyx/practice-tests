import data from "./data.json" with { type: "json" };
export type CourseId = "integrated-care" | "pharmacology";
export interface Source {
  id: string;
  title: string;
  file: string;
  sha256: string;
  kind: string;
}
export interface SourceReference {
  sourceId: string;
  page: number;
  excerpt: string;
}
export interface Assessment {
  id: string;
  courseId: CourseId;
  title: string;
  date: string;
  weight: number;
  format: string;
  scope: string;
  sources: SourceReference[];
}
export interface CurriculumUnit {
  id: string;
  courseId: CourseId;
  title: string;
  order: number;
  scope: string;
  gaps: string[];
}
export interface Concept {
  id: string;
  unitId: string;
  clusterId: string;
  title: string;
  prerequisiteIds: string[];
  sources: SourceReference[];
}
export interface Question {
  id: string;
  courseId: CourseId;
  unitId: string;
  clusterId: string;
  kind: "recall" | "constructed";
  title?: string;
  prompt: string;
  rubric: string[];
  conceptIds: string[];
  prerequisiteQuestionIds: string[];
  sources: SourceReference[];
  importance: number;
  estimatedSeconds: number;
  origin?: { sourceId: string; page: number; year: number; marks: number };
}
export interface Cluster {
  id: string;
  unitId: string;
  title: string;
  section: string;
  questionId: string;
  diagram: {
    kind: "chain" | "map" | "compare" | "timeline";
    central: string;
    nodes: { conceptId: string; label: string; answer: string }[];
  };
}
interface Curriculum {
  sources: Source[];
  assessments: Assessment[];
  units: CurriculumUnit[];
  concepts: Concept[];
  questions: Question[];
  clusters: Cluster[];
}
export const curriculum = data as Curriculum;
export const { sources, assessments, units, concepts, questions, clusters } =
  curriculum;
export const courses = [
  {
    id: "integrated-care" as const,
    name: "Integrated Care Nursing",
    label: "Integrated Care",
  },
  {
    id: "pharmacology" as const,
    name: "Pharmacology Nursing",
    label: "Pharmacology",
  },
];
export const questionById = new Map(questions.map((q) => [q.id, q]));
export const clusterById = new Map(clusters.map((c) => [c.id, c]));
export const sourceById = new Map(sources.map((s) => [s.id, s]));
export function question(id: string): Question {
  const value = questionById.get(id);
  if (value === undefined)
    throw new Error(
      `Cannot open revision question ${id}: it is absent from the published curriculum. Keep saved progress and check the content migration.`,
    );
  return value;
}

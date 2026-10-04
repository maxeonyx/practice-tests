export type CourseId = "integrated-care" | "pharmacology";
export interface SourceReference {
  file: string;
  page?: number;
  learningOutcome?: string;
}
export interface Course {
  id: CourseId;
  name: string;
  label: string;
}
export interface Assessment {
  id: string;
  courseId: CourseId;
  title: string;
  date?: string;
}
export interface CurriculumUnit {
  id: string;
  courseId: CourseId;
  title: string;
  sources: SourceReference[];
}
export interface Concept {
  id: string;
  unitId: string;
  title: string;
  prerequisiteIds: string[];
  sources: SourceReference[];
}
export interface Question {
  id: string;
  courseId: CourseId;
  conceptIds: string[];
  prompt: string;
  rubric: string[];
  prerequisiteQuestionIds: string[];
  sources: SourceReference[];
}
export const courses: Course[] = [
  {
    id: "integrated-care",
    name: "Integrated Care Nursing",
    label: "Integrated Care",
  },
  { id: "pharmacology", name: "Pharmacology Nursing", label: "Pharmacology" },
];

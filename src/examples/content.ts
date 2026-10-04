import {
  question,
  type Question,
  type SourceReference,
} from "../content/curriculum";

export const examples = [
  {
    id: "flashcard",
    label: "Ordinary flashcard",
    rootId: "medicine-teach-back",
  },
  {
    id: "multiple-choice",
    label: "Multiple choice",
    rootId: "example-vaccine",
  },
  { id: "true-false", label: "True or false", rootId: "example-nod" },
  { id: "diagram", label: "Diagram question", rootId: "example-ace" },
  { id: "open-answer", label: "Open answer", rootId: "example-open" },
] as const;
export type ExampleKind = (typeof examples)[number]["id"];
export interface ExampleCard {
  id: string;
  courseId: Question["courseId"];
  prompt: string;
  rubric: string[];
  prerequisiteQuestionIds: string[];
  sources: SourceReference[];
  visual?: Question["visual"];
  choices?: string[];
  correctChoice?: number;
  incorrectExplanations?: string[];
}
const literacy14 = (excerpt: string): SourceReference => ({
  sourceId: "literacy",
  page: 14,
  excerpt,
});
const schedule1: SourceReference = {
  sourceId: "schedule",
  page: 1,
  excerpt: "Rotarix® (oral)",
};
export const cards = new Map<string, ExampleCard>([
  ...[
    "medicine-teach-back",
    "teach-back-purpose",
    "health-communication-responsibility",
    "health-literacy-meaning",
  ].map((id): [string, ExampleCard] => [id, question(id)]),
  [
    "example-vaccine",
    {
      id: "example-vaccine",
      courseId: "integrated-care",
      prompt:
        "At the six-week immunisation visit, which vaccine is given by mouth?",
      rubric: ["Rotarix — the oral rotavirus vaccine."],
      choices: ["Infanrix hexa", "Rotarix", "Prevenar 13", "Bexsero"],
      correctChoice: 1,
      incorrectExplanations: [
        "Infanrix hexa is injected.",
        "",
        "Prevenar 13 is injected.",
        "Bexsero is injected.",
      ],
      prerequisiteQuestionIds: ["example-rotavirus", "example-oral"],
      sources: [
        schedule1,
        {
          sourceId: "schedule",
          page: 2,
          excerpt: "RV1 oral vaccine (Rotarix®)",
        },
      ],
      visual: question("six-week-oral-vaccine").visual,
    },
  ],
  [
    "example-rotavirus",
    {
      id: "example-rotavirus",
      courseId: "integrated-care",
      prompt: "Which disease does Rotarix protect against?",
      rubric: ["Rotavirus infection."],
      prerequisiteQuestionIds: [],
      sources: [schedule1],
      visual: question("six-week-oral-vaccine").visual,
    },
  ],
  [
    "example-oral",
    {
      id: "example-oral",
      courseId: "integrated-care",
      prompt: "How is the rotavirus vaccine given to an infant?",
      rubric: ["By mouth, using an oral tube. It is not injected."],
      prerequisiteQuestionIds: [],
      sources: [
        {
          sourceId: "schedule",
          page: 2,
          excerpt: "RV1 oral vaccine (Rotarix®)",
        },
      ],
      visual: question("six-week-oral-vaccine").visual,
    },
  ],
  [
    "example-nod",
    {
      id: "example-nod",
      courseId: "integrated-care",
      prompt:
        "A patient’s nod confirms they understand how to take a medicine.",
      rubric: [
        "False. A nod does not demonstrate understanding. Use teach-back: ask the person to explain how they will take the medicine.",
      ],
      choices: ["True", "False"],
      correctChoice: 1,
      incorrectExplanations: [
        "Nodding does not show what the person has understood.",
        "",
      ],
      prerequisiteQuestionIds: ["teach-back-purpose"],
      sources: [
        literacy14(
          "Use teach back to ensure patients have understood any health messages/information",
        ),
      ],
      visual: question("medicine-teach-back").visual,
    },
  ],
  [
    "example-ace",
    {
      id: "example-ace",
      courseId: "pharmacology",
      prompt:
        "In the renin–angiotensin–aldosterone system, which enzyme converts angiotensin I into angiotensin II?",
      rubric: [
        "Angiotensin-converting enzyme (ACE) converts angiotensin I into angiotensin II.",
      ],
      prerequisiteQuestionIds: [],
      sources: [
        {
          sourceId: "pharm",
          page: 243,
          excerpt:
            "These drugs work by inhibiting the angiotensin converting enzyme (ACE). This enzyme is needed to convert angiotensin I into angiotensin II (see diagram on the next page).",
        },
        {
          sourceId: "pharm",
          page: 244,
          excerpt: "The renin – angiotensin – aldosterone system.",
        },
      ],
    },
  ],
  [
    "example-open",
    {
      id: "example-open",
      courseId: "integrated-care",
      prompt:
        "A person nods while you explain a new medicine, but cannot describe when they will take it at home. Describe three actions you would take before ending the consultation to support and check their understanding.",
      rubric: [
        "Respond with empathy and take responsibility for making the explanation understandable.",
        "Explain again in plain language, avoid jargon, and give a manageable amount of information. Discuss or demonstrate the key points; use a translator if needed.",
        "Use teach-back: ask the person to explain how they will take the medicine. Clarify any gaps and check understanding again.",
      ],
      prerequisiteQuestionIds: [
        "health-communication-responsibility",
        "example-plain-language",
        "example-teachback-method",
      ],
      sources: [
        question("health-communication-responsibility").sources[0],
        literacy14("Show empathy"),
        literacy14(
          "Avoid using jargon – speak using simple terms and plain language",
        ),
        literacy14(
          "Use teach back to ensure patients have understood any health messages/information",
        ),
      ],
      visual: question("medicine-teach-back").visual,
    },
  ],
  [
    "example-plain-language",
    {
      id: "example-plain-language",
      courseId: "integrated-care",
      prompt:
        "When someone struggles to understand a medicine explanation, how should you change the language?",
      rubric: [
        "Avoid jargon. Use simple terms and plain language, with a manageable amount of information.",
      ],
      prerequisiteQuestionIds: [],
      sources: [
        literacy14(
          "Avoid using jargon – speak using simple terms and plain language",
        ),
      ],
    },
  ],
  [
    "example-teachback-method",
    {
      id: "example-teachback-method",
      courseId: "integrated-care",
      prompt: "How can you use teach-back to check a person’s medicine plan?",
      rubric: [
        "Ask them to explain how they will take the medicine in their own words. Clarify any gaps and check understanding again.",
      ],
      prerequisiteQuestionIds: [],
      sources: [
        literacy14(
          "Use teach back to ensure patients have understood any health messages/information",
        ),
      ],
      visual: question("medicine-teach-back").visual,
    },
  ],
]);
export function card(id: string): ExampleCard {
  const value = cards.get(id);
  if (value === undefined)
    throw new Error(
      `The example card ${id} is missing. Return to Examples and reopen the question.`,
    );
  return value;
}

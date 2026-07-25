import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const commonSource = await readFile(resolve(repoRoot, 'js/common.js'), 'utf8');
const common = await import(`data:text/javascript;base64,${Buffer.from(commonSource).toString('base64')}`);
const test = JSON.parse(await readFile(resolve(repoRoot, 'tests/bioscience-impaired-body-function.json'), 'utf8'));

const firstByType = Object.fromEntries(
  ['multiple-choice', 'true-false', 'matching', 'short-answer'].map((type) => [type, test.questions.find((question) => question.type === type)]),
);

const attempt = {
  testId: test.id,
  startedAt: Date.now(),
  endTime: Date.now() + (test.durationMinutes * 60 * 1000),
  currentIndex: 0,
  reviewMode: false,
  submitted: true,
  submittedAt: Date.now(),
  answers: {
    [firstByType['multiple-choice'].id]: firstByType['multiple-choice'].correctAnswer,
    [firstByType['true-false'].id]: firstByType['true-false'].correctAnswer,
    [firstByType.matching.id]: Object.fromEntries(firstByType.matching.pairs.map((pair) => [pair.prompt, pair.answer])),
    [firstByType['short-answer'].id]: 'Structured self-review response for marking guidance.',
  },
  flags: {},
};

const summary = common.scoreTest(test, attempt);

const requiredSummaryFields = ['earnedPoints', 'maxPoints', 'totalMarks', 'manualReviewMarks', 'correctCount', 'partialCount', 'incorrectCount', 'notAnsweredCount', 'percentage', 'detailedResults'];
for (const field of requiredSummaryFields) {
  if (!(field in summary)) {
    throw new Error(`Missing summary field: ${field}`);
  }
}

if (!Array.isArray(summary.detailedResults) || summary.detailedResults.length !== test.questions.length) {
  throw new Error('Detailed results length does not match question count.');
}

for (const item of summary.detailedResults) {
  if (!item.question?.id) {
    throw new Error('Detailed result is missing question metadata.');
  }

  if (typeof item.availableMarks !== 'number' || typeof item.earnedPoints !== 'number' || typeof item.maxPoints !== 'number') {
    throw new Error(`Detailed result for ${item.question.id} is missing mark fields.`);
  }

  if (item.question.type === 'short-answer') {
    if (typeof item.display?.response !== 'string') {
      throw new Error(`Short-answer result for ${item.question.id} is missing response text.`);
    }
    continue;
  }

  if (typeof item.display?.response !== 'string' || typeof item.display?.correct !== 'string') {
    throw new Error(`Auto-marked result for ${item.question.id} is missing display fields.`);
  }
}

const sampleResultsView = summary.detailedResults.slice(0, 4).map((item) => ({
  id: item.question.id,
  type: item.question.type,
  status: item.status,
  marksLabel: item.status === 'short-answer'
    ? `${common.formatMarks(item.availableMarks)} marks self-review`
    : `${common.formatMarks(item.earnedPoints)} / ${common.formatMarks(item.maxPoints)} marks`,
  response: item.display.response,
  correct: item.display.correct ?? null,
}));

console.log(JSON.stringify({
  testId: test.id,
  answeredQuestionIds: Object.keys(attempt.answers),
  summary: {
    earnedPoints: summary.earnedPoints,
    maxPoints: summary.maxPoints,
    totalMarks: summary.totalMarks,
    manualReviewMarks: summary.manualReviewMarks,
    correctCount: summary.correctCount,
    partialCount: summary.partialCount,
    incorrectCount: summary.incorrectCount,
    notAnsweredCount: summary.notAnsweredCount,
    percentage: summary.percentage,
  },
  sampleResultsView,
}, null, 2));

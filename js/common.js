const STORAGE_PREFIX = 'practice-tests';
const LIVE_ANNOUNCE_DELAY_MS = 20;
const TRANSIENT_MESSAGE_KEY = `${STORAGE_PREFIX}:transient-message`;

export function testParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('test');
}

export async function loadCatalog() {
  const response = await fetch('tests/index.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Could not load the test catalog.');
  }

  const catalog = await response.json();
  validateCatalog(catalog);
  return catalog;
}

export async function loadTest(testId) {
  const catalog = await loadCatalog();
  const entry = catalog.tests.find((item) => item.id === testId);

  if (!entry) {
    throw new Error(`No test was found for id "${testId}".`);
  }

  const response = await fetch(entry.file, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Could not load the test file for "${testId}".`);
  }

  const test = await response.json();
  validateTest(test);
  return test;
}

export function createAttempt(test) {
  return {
    testId: test.id,
    startedAt: Date.now(),
    endTime: Date.now() + (test.durationMinutes * 60 * 1000),
    currentIndex: 0,
    reviewMode: false,
    submitted: false,
    submittedAt: null,
    answers: {},
    flags: {},
  };
}

export function getAttemptKey(testId) {
  return `${STORAGE_PREFIX}:attempt:${testId}`;
}

export function announceLive(app, message) {
  clearLiveAnnouncement(app);
  app.liveMessage = '';
  app.announceTimerId = window.setTimeout(() => {
    app.liveMessage = message;
    app.announceTimerId = null;
  }, LIVE_ANNOUNCE_DELAY_MS);
}

export function clearLiveAnnouncement(app) {
  if (!app.announceTimerId) {
    return;
  }

  window.clearTimeout(app.announceTimerId);
  app.announceTimerId = null;
}

export function setTransientMessage(message) {
  window.sessionStorage.setItem(TRANSIENT_MESSAGE_KEY, message);
}

export function consumeTransientMessage() {
  const message = window.sessionStorage.getItem(TRANSIENT_MESSAGE_KEY);

  if (!message) {
    return null;
  }

  window.sessionStorage.removeItem(TRANSIENT_MESSAGE_KEY);
  return message;
}

export function getAttempt(testOrMeta) {
  const raw = window.localStorage.getItem(getAttemptKey(testOrMeta.id));

  if (!raw) {
    return null;
  }

  const parsed = safeParseJson(raw);

  if (!parsed) {
    clearAttempt(testOrMeta.id);
    return null;
  }

  const normalized = normalizeAttempt(testOrMeta, parsed);

  if (!normalized) {
    clearAttempt(testOrMeta.id);
    return null;
  }

  return normalized;
}

export function saveAttempt(testId, attempt) {
  window.localStorage.setItem(getAttemptKey(testId), JSON.stringify(attempt));
}

export function clearAttempt(testId) {
  window.localStorage.removeItem(getAttemptKey(testId));
}

export function remainingMs(attempt) {
  if (!attempt?.endTime) {
    return 0;
  }

  return Math.max(0, attempt.endTime - Date.now());
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function questionTypesLabel(type) {
  return {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    matching: 'Word Matching',
    'short-answer': 'Short Answer',
  }[type] || type;
}

export function questionMarks(question) {
  return question.marks;
}

export function formatMarks(value) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, '');
}

export function isQuestionAnswered(question, answer) {
  if (question.type === 'matching') {
    if (!answer || typeof answer !== 'object') {
      return false;
    }

    return question.pairs.every((pair) => Boolean(answer[pair.prompt]));
  }

  if (question.type === 'short-answer') {
    return typeof answer === 'string' && answer.trim().length > 0;
  }

  return typeof answer === 'string' && answer.length > 0;
}

export function scoreTest(test, attempt) {
  const detailedResults = test.questions.map((question) => scoreQuestion(question, attempt.answers[question.id]));
  const autoMarked = detailedResults.filter((item) => item.isAutoMarked);
  const earnedPoints = autoMarked.reduce((total, item) => total + item.earnedPoints, 0);
  const maxPoints = autoMarked.reduce((total, item) => total + item.maxPoints, 0);
  const totalMarks = detailedResults.reduce((total, item) => total + item.availableMarks, 0);
  const manualReviewMarks = totalMarks - maxPoints;
  const correctCount = autoMarked.filter((item) => item.status === 'correct').length;
  const partialCount = autoMarked.filter((item) => item.status === 'partial').length;
  const incorrectCount = autoMarked.filter((item) => item.status === 'incorrect').length;
  const notAnsweredCount = autoMarked.filter((item) => item.status === 'not-answered').length;
  const percentage = maxPoints === 0 ? 0 : Math.round((earnedPoints / maxPoints) * 100);

  return {
    earnedPoints,
    maxPoints,
    totalMarks: roundScore(totalMarks),
    manualReviewMarks: roundScore(manualReviewMarks),
    correctCount,
    partialCount,
    incorrectCount,
    notAnsweredCount,
    percentage,
    detailedResults,
  };
}

export function scoreQuestion(question, answer) {
  const marks = questionMarks(question);

  if (question.type === 'short-answer') {
    return {
      question,
      answer,
      availableMarks: marks,
      maxPoints: 0,
      earnedPoints: 0,
      isAutoMarked: false,
      status: 'short-answer',
      display: {
        response: typeof answer === 'string' ? answer.trim() : '',
      },
    };
  }

  if (question.type === 'matching') {
    return scoreMatchingQuestion(question, answer, marks);
  }

  if (!isQuestionAnswered(question, answer)) {
    return {
      question,
      answer,
      availableMarks: marks,
      maxPoints: marks,
      earnedPoints: 0,
      isAutoMarked: true,
      status: 'not-answered',
      display: {
        response: formatResponse(question, answer),
        correct: formatCorrectAnswer(question),
      },
    };
  }

  const isCorrect = isCorrectAnswer(question, answer);

  return {
    question,
    answer,
    availableMarks: marks,
    maxPoints: marks,
    earnedPoints: isCorrect ? marks : 0,
    isAutoMarked: true,
    status: isCorrect ? 'correct' : 'incorrect',
    display: {
      response: formatResponse(question, answer),
      correct: formatCorrectAnswer(question),
    },
  };
}

export function isCorrectAnswer(question, answer) {
  if (question.type === 'matching') {
    return question.pairs.every((pair) => answer?.[pair.prompt] === pair.answer);
  }

  return answer === question.correctAnswer;
}

function formatResponse(question, answer) {
  if (question.type === 'matching') {
    if (!answer || typeof answer !== 'object') {
      return '';
    }

    return question.pairs
      .filter((pair) => answer[pair.prompt])
      .map((pair) => `${pair.prompt}: ${answer[pair.prompt]}`)
      .join('; ');
  }

  if (typeof answer === 'string') {
    return answer.trim();
  }

  return '';
}

function formatCorrectAnswer(question) {
  if (question.type === 'matching') {
    return question.pairs.map((pair) => `${pair.prompt}: ${pair.answer}`).join('; ');
  }

  return question.correctAnswer;
}

function scoreMatchingQuestion(question, answer, marks) {
  const answers = answer && typeof answer === 'object' ? answer : {};
  const selectedCount = question.pairs.filter((pair) => Boolean(answers[pair.prompt])).length;

  if (selectedCount === 0) {
    return {
      question,
      answer,
      availableMarks: marks,
      maxPoints: marks,
      earnedPoints: 0,
      isAutoMarked: true,
      status: 'not-answered',
      display: {
        response: formatResponse(question, answer),
        correct: formatCorrectAnswer(question),
      },
    };
  }

  const correctPairs = question.pairs.filter((pair) => answers[pair.prompt] === pair.answer).length;
  const earnedPoints = roundScore((marks * correctPairs) / question.pairs.length);
  const status = correctPairs === question.pairs.length ? 'correct' : correctPairs > 0 ? 'partial' : 'incorrect';

  return {
    question,
    answer,
    availableMarks: marks,
    maxPoints: marks,
    earnedPoints,
    isAutoMarked: true,
    status,
    display: {
      response: formatResponse(question, answer),
      correct: formatCorrectAnswer(question),
      pairSummary: `${correctPairs} of ${question.pairs.length} pairs correct`,
    },
  };
}

function validateCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.tests)) {
    throw new Error('The test catalog is missing a tests array.');
  }

  const seenIds = new Set();

  catalog.tests.forEach((entry) => {
    if (!entry?.id || !entry.title || !entry.description || !entry.file) {
      throw new Error('Each catalog entry must include id, title, description, and file.');
    }

    if (seenIds.has(entry.id)) {
      throw new Error(`The catalog contains a duplicate test id: "${entry.id}".`);
    }

    seenIds.add(entry.id);

    if (!Number.isInteger(entry.durationMinutes) || entry.durationMinutes <= 0) {
      throw new Error(`Catalog entry "${entry.id}" has an invalid duration.`);
    }

    if (!Number.isInteger(entry.questionCount) || entry.questionCount <= 0) {
      throw new Error(`Catalog entry "${entry.id}" has an invalid questionCount.`);
    }

    if (!Array.isArray(entry.questionTypes) || entry.questionTypes.length === 0) {
      throw new Error(`Catalog entry "${entry.id}" must list its question types.`);
    }
  });
}

function validateTest(test) {
  if (!test?.id || !Array.isArray(test.questions) || !test.title) {
    throw new Error('Test data is missing required fields.');
  }

  if (!Number.isInteger(test.durationMinutes) || test.durationMinutes <= 0) {
    throw new Error(`Test "${test.id}" has an invalid duration.`);
  }

  const seenIds = new Set();

  test.questions.forEach((question) => {
    if (!question.id || !question.type || !question.prompt) {
      throw new Error(`Question data is incomplete in test "${test.id}".`);
    }

    if (seenIds.has(question.id)) {
      throw new Error(`Test "${test.id}" contains a duplicate question id: "${question.id}".`);
    }

    seenIds.add(question.id);
    validateQuestion(test.id, question);
  });
}

function validateQuestion(testId, question) {
  if (!Number.isFinite(question.marks) || question.marks <= 0) {
    throw new Error(`Question "${question.id}" in test "${testId}" must define a positive marks value.`);
  }

  switch (question.type) {
    case 'multiple-choice':
      validateOptionsQuestion(testId, question, 2);
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`Question "${question.id}" in test "${testId}" has a correctAnswer that is not in options.`);
      }
      break;
    case 'true-false':
      if (!['True', 'False'].includes(question.correctAnswer)) {
        throw new Error(`Question "${question.id}" in test "${testId}" must use "True" or "False" as its correctAnswer.`);
      }
      break;
    case 'matching':
      validateMatchingQuestion(testId, question);
      break;
    case 'short-answer':
      if (question.sampleResponseGuide && typeof question.sampleResponseGuide !== 'string') {
        throw new Error(`Question "${question.id}" in test "${testId}" has an invalid sampleResponseGuide.`);
      }
      break;
    default:
      throw new Error(`Question "${question.id}" in test "${testId}" uses unsupported type "${question.type}".`);
  }
}

function validateOptionsQuestion(testId, question, minOptions) {
  if (!Array.isArray(question.options) || question.options.length < minOptions) {
    throw new Error(`Question "${question.id}" in test "${testId}" must define at least ${minOptions} options.`);
  }

  const optionSet = new Set(question.options);

  if (optionSet.size !== question.options.length) {
    throw new Error(`Question "${question.id}" in test "${testId}" contains duplicate options.`);
  }

  if (question.options.some((option) => typeof option !== 'string' || !option.trim())) {
    throw new Error(`Question "${question.id}" in test "${testId}" contains an invalid option.`);
  }
}

function validateMatchingQuestion(testId, question) {
  validateOptionsQuestion(testId, question, 1);

  if (!Array.isArray(question.pairs) || question.pairs.length === 0) {
    throw new Error(`Question "${question.id}" in test "${testId}" must define at least one pair.`);
  }

  const prompts = new Set();
  const answers = new Set();

  question.pairs.forEach((pair) => {
    if (!pair?.prompt || !pair.answer) {
      throw new Error(`Question "${question.id}" in test "${testId}" contains an incomplete matching pair.`);
    }

    if (prompts.has(pair.prompt)) {
      throw new Error(`Question "${question.id}" in test "${testId}" contains a duplicate matching prompt.`);
    }

    if (answers.has(pair.answer)) {
      throw new Error(`Question "${question.id}" in test "${testId}" contains a duplicate matching answer.`);
    }

    if (!question.options.includes(pair.answer)) {
      throw new Error(`Question "${question.id}" in test "${testId}" contains a matching answer that is not in options.`);
    }

    prompts.add(pair.prompt);
    answers.add(pair.answer);
  });
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeAttempt(testOrMeta, attempt) {
  if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
    return null;
  }

  const questionCount = questionTotal(testOrMeta);
  const questionIds = Array.isArray(testOrMeta.questions) ? new Set(testOrMeta.questions.map((question) => question.id)) : null;

  if (attempt.testId !== testOrMeta.id) {
    return null;
  }

  return {
    testId: testOrMeta.id,
    startedAt: asTimestamp(attempt.startedAt) ?? Date.now(),
    endTime: asTimestamp(attempt.endTime) ?? (Date.now() + ((testOrMeta.durationMinutes ?? 90) * 60 * 1000)),
    currentIndex: clampIndex(attempt.currentIndex, questionCount),
    reviewMode: Boolean(attempt.reviewMode),
    submitted: Boolean(attempt.submitted),
    submittedAt: asTimestamp(attempt.submittedAt),
    answers: normalizeAnswers(questionIds, attempt.answers),
    flags: normalizeFlags(questionIds, attempt.flags),
    summary: normalizeSummary(attempt.summary),
  };
}

function questionTotal(testOrMeta) {
  if (Array.isArray(testOrMeta.questions)) {
    return testOrMeta.questions.length;
  }

  return Number.isInteger(testOrMeta.questionCount) ? testOrMeta.questionCount : 1;
}

function clampIndex(index, questionCount) {
  if (questionCount <= 0) {
    return 0;
  }

  if (!Number.isInteger(index)) {
    return 0;
  }

  return Math.min(Math.max(index, 0), questionCount - 1);
}

function normalizeAnswers(questionIds, answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return {};
  }

  const entries = Object.entries(answers).filter(([questionId]) => !questionIds || questionIds.has(questionId));
  return Object.fromEntries(entries.map(([questionId, answer]) => [questionId, normalizeAnswerValue(answer)]).filter(([, answer]) => answer !== undefined));
}

function normalizeAnswerValue(answer) {
  if (typeof answer === 'string') {
    return answer;
  }

  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
    return undefined;
  }

  const entries = Object.entries(answer).filter(([, value]) => typeof value === 'string');
  return Object.fromEntries(entries);
}

function normalizeFlags(questionIds, flags) {
  if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
    return {};
  }

  const entries = Object.entries(flags)
    .filter(([questionId]) => !questionIds || questionIds.has(questionId))
    .map(([questionId, value]) => [questionId, Boolean(value)]);

  return Object.fromEntries(entries);
}

function normalizeSummary(summary) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    return null;
  }

  return {
    earnedPoints: Number.isFinite(summary.earnedPoints) ? summary.earnedPoints : 0,
    maxPoints: Number.isFinite(summary.maxPoints) ? summary.maxPoints : 0,
    totalMarks: Number.isFinite(summary.totalMarks) ? summary.totalMarks : 0,
    manualReviewMarks: Number.isFinite(summary.manualReviewMarks) ? summary.manualReviewMarks : 0,
    percentage: Number.isFinite(summary.percentage) ? summary.percentage : 0,
    submittedByTimer: Boolean(summary.submittedByTimer),
  };
}

function asTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

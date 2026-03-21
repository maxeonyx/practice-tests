const STORAGE_PREFIX = 'practice-tests';

export function testParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('test');
}

export async function loadCatalog() {
  const response = await fetch('tests/index.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Could not load the test catalog.');
  }

  return response.json();
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

export function getAttempt(testId) {
  const raw = window.localStorage.getItem(getAttemptKey(testId));

  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
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
  const autoMarked = detailedResults.filter((item) => item.maxPoints > 0);
  const earnedPoints = autoMarked.reduce((total, item) => total + item.earnedPoints, 0);
  const maxPoints = autoMarked.reduce((total, item) => total + item.maxPoints, 0);
  const correctCount = autoMarked.filter((item) => item.status === 'correct').length;
  const incorrectCount = autoMarked.filter((item) => item.status === 'incorrect').length;
  const notAnsweredCount = autoMarked.filter((item) => item.status === 'not-answered').length;
  const percentage = maxPoints === 0 ? 0 : Math.round((earnedPoints / maxPoints) * 100);

  return {
    earnedPoints,
    maxPoints,
    correctCount,
    incorrectCount,
    notAnsweredCount,
    percentage,
    detailedResults,
  };
}

export function scoreQuestion(question, answer) {
  if (question.type === 'short-answer') {
    return {
      question,
      answer,
      maxPoints: 0,
      earnedPoints: 0,
      status: 'short-answer',
      display: {
        response: typeof answer === 'string' ? answer.trim() : '',
      },
    };
  }

  if (!isQuestionAnswered(question, answer)) {
    return {
      question,
      answer,
      maxPoints: 1,
      earnedPoints: 0,
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
    maxPoints: 1,
    earnedPoints: isCorrect ? 1 : 0,
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

function validateTest(test) {
  if (!test?.id || !Array.isArray(test.questions) || !test.title) {
    throw new Error('Test data is missing required fields.');
  }

  test.questions.forEach((question) => {
    if (!question.id || !question.type || !question.prompt) {
      throw new Error(`Question data is incomplete in test "${test.id}".`);
    }
  });
}

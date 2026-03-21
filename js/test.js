import {
  createAttempt,
  formatDuration,
  getAttempt,
  isQuestionAnswered,
  loadTest,
  questionTypesLabel,
  remainingMs,
  saveAttempt,
  scoreTest,
  testParam,
} from './common.js?v=20260321-1';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      test: null,
      attempt: null,
      remainingMs: 0,
      reviewMode: false,
      navOpen: false,
      timerId: null,
      submitting: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.test.questions[this.attempt.currentIndex];
    },
    currentQuestionNumber() {
      return this.attempt.currentIndex + 1;
    },
    currentAnswer() {
      return this.attempt.answers[this.currentQuestion.id] ?? '';
    },
    progressPercent() {
      if (this.reviewMode) {
        return 100;
      }

      return ((this.attempt.currentIndex + 1) / this.test.questions.length) * 100;
    },
    isLastQuestion() {
      return this.attempt.currentIndex === this.test.questions.length - 1;
    },
    flaggedCount() {
      return Object.values(this.attempt.flags).filter(Boolean).length;
    },
    answeredCount() {
      return this.test.questions.filter((question) => isQuestionAnswered(question, this.attempt.answers[question.id])).length;
    },
    unansweredCount() {
      return this.test.questions.length - this.answeredCount;
    },
  },
  async mounted() {
    try {
      const testId = testParam();

      if (!testId) {
        throw new Error('No test id was provided. Start from the landing page.');
      }

      this.test = await loadTest(testId);
      this.attempt = getAttempt(this.test) || createAttempt(this.test);
      this.reviewMode = Boolean(this.attempt.reviewMode);
      this.navOpen = window.innerWidth >= 960;
      this.remainingMs = remainingMs(this.attempt);
      saveAttempt(this.test.id, this.attempt);

      if (this.attempt.submitted) {
        this.redirectToResults();
        return;
      }

      if (this.remainingMs === 0) {
        this.submitTest(true);
        return;
      }

      this.timerId = window.setInterval(() => {
        this.remainingMs = remainingMs(this.attempt);

        if (this.remainingMs === 0) {
          this.submitTest(true);
        }
      }, 1000);
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  },
  methods: {
    formatDuration,
    typeLabel(type) {
      return questionTypesLabel(type);
    },
    persistAttempt() {
      this.attempt.reviewMode = this.reviewMode;
      saveAttempt(this.test.id, this.attempt);
    },
    updateAnswer(questionId, value) {
      this.attempt.answers = {
        ...this.attempt.answers,
        [questionId]: value,
      };
      this.persistAttempt();
    },
    updateMatchingAnswer(questionId, prompt, value) {
      const existing = this.attempt.answers[questionId] || {};
      this.attempt.answers = {
        ...this.attempt.answers,
        [questionId]: {
          ...existing,
          [prompt]: value,
        },
      };
      this.persistAttempt();
    },
    matchingAnswerValue(prompt) {
      return this.attempt.answers[this.currentQuestion.id]?.[prompt] || '';
    },
    isMatchingOptionDisabled(option, prompt) {
      const answers = this.attempt.answers[this.currentQuestion.id] || {};
      return Object.entries(answers).some(([currentPrompt, selectedOption]) => currentPrompt !== prompt && selectedOption === option);
    },
    goPrevious() {
      if (this.attempt.currentIndex > 0) {
        this.attempt.currentIndex -= 1;
        this.persistAttempt();
      }
    },
    goNext() {
      if (this.isLastQuestion) {
        this.openReview();
        return;
      }

      this.attempt.currentIndex += 1;
      this.persistAttempt();
    },
    toggleFlag(questionId) {
      this.attempt.flags = {
        ...this.attempt.flags,
        [questionId]: !this.attempt.flags[questionId],
      };
      this.persistAttempt();
    },
    isFlagged(questionId) {
      return Boolean(this.attempt.flags[questionId]);
    },
    openReview() {
      this.reviewMode = true;
      this.navOpen = true;
      this.persistAttempt();
    },
    closeReview() {
      this.reviewMode = false;
      this.persistAttempt();
    },
    toggleNavPanel() {
      this.navOpen = !this.navOpen;
    },
    jumpToQuestion(index) {
      this.attempt.currentIndex = index;
      this.reviewMode = false;

      if (window.innerWidth < 960) {
        this.navOpen = false;
      }

      this.persistAttempt();
    },
    answeredLabel(questionId) {
      const question = this.test.questions.find((item) => item.id === questionId);
      return isQuestionAnswered(question, this.attempt.answers[questionId]) ? 'Answered' : 'Unanswered';
    },
    statusClass(questionId) {
      const question = this.test.questions.find((item) => item.id === questionId);
      return isQuestionAnswered(question, this.attempt.answers[questionId]) ? 'status-answered' : 'status-unanswered';
    },
    questionNavLabel(questionId) {
      return this.isFlagged(questionId) ? `${this.answeredLabel(questionId)} - Flagged` : this.answeredLabel(questionId);
    },
    questionNavClass(questionId, index) {
      return [
        'question-nav-button',
        isQuestionAnswered(this.test.questions[index], this.attempt.answers[questionId]) ? 'question-nav-answered' : 'question-nav-unanswered',
        { 'question-nav-current': !this.reviewMode && this.attempt.currentIndex === index },
        { 'question-nav-flagged': this.isFlagged(questionId) },
      ];
    },
    submitTest(fromTimer) {
      if (this.submitting || !this.test || !this.attempt || this.attempt.submitted) {
        return;
      }

      this.submitting = true;
      this.attempt.submitted = true;
      this.attempt.submittedAt = Date.now();
      this.attempt.reviewMode = false;
      this.reviewMode = false;
      const summary = scoreTest(this.test, this.attempt);
      this.attempt.summary = {
        earnedPoints: summary.earnedPoints,
        maxPoints: summary.maxPoints,
        totalMarks: summary.totalMarks,
        manualReviewMarks: summary.manualReviewMarks,
        percentage: summary.percentage,
        submittedByTimer: fromTimer,
      };
      saveAttempt(this.test.id, this.attempt);

      if (this.timerId) {
        window.clearInterval(this.timerId);
      }

      this.redirectToResults();
    },
    redirectToResults() {
      window.location.href = `results.html?test=${encodeURIComponent(this.test.id)}`;
    },
  },
}).mount('#app');

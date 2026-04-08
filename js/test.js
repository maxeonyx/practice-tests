import {
  announceLive,
  clearLiveAnnouncement,
  createAttempt,
  formatDuration,
  getAttempt,
  isQuestionAnswered,
  loadTest,
  questionTypesLabel,
  remainingMs,
  saveAttempt,
  scoreTest,
  setTransientMessage,
  shouldPreserveSkipLinkFocus,
  testParam,
} from './common.js?v=20260409-9';

const { createApp } = Vue;
const QUESTION_NAV_LABEL_MAX_LENGTH = 80;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      liveMessage: '',
      test: null,
      attempt: null,
      remainingMs: 0,
      reviewMode: false,
      navOpen: false,
      announceTimerId: null,
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
    questionHeadingId() {
      return this.currentQuestion ? `question-heading-${this.currentQuestion.id}` : 'question-heading';
    },
    questionHelpId() {
      return this.currentQuestion ? `question-help-${this.currentQuestion.id}` : 'question-help';
    },
    questionMapHeadingId() {
      return 'question-map-heading';
    },
  },
  watch: {
    reviewMode(isReviewMode) {
      this.$nextTick(() => {
        if (isReviewMode) {
          this.focusReviewHeading();
        } else {
          this.focusQuestionHeading();
        }
      });
    },
    'attempt.currentIndex'() {
      this.announce(`Question ${this.currentQuestionNumber} loaded.`);

      if (this.reviewMode) {
        return;
      }

      this.$nextTick(() => {
        this.focusQuestionHeading();
      });
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
      this.announce(`Loaded ${this.test.title}.`);

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

      if (!this.error) {
        this.$nextTick(() => {
          if (shouldPreserveSkipLinkFocus()) {
            return;
          }

          if (this.reviewMode) {
            this.focusReviewHeading();
            return;
          }

          this.focusQuestionHeading();
        });
      }
    }
  },
  beforeUnmount() {
    clearLiveAnnouncement(this);
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  },
  methods: {
    formatDuration,
    announce(message) {
      announceLive(this, message);
    },
    focusQuestionHeading() {
      this.$refs.questionHeading?.focus();
    },
    focusReviewHeading() {
      this.$refs.reviewHeading?.focus();
    },
    focusQuestionMapHeading() {
      this.$refs.questionMapHeading?.focus();
    },
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
      const nextFlagged = !this.attempt.flags[questionId];
      this.attempt.flags = {
        ...this.attempt.flags,
        [questionId]: nextFlagged,
      };
      this.persistAttempt();
      this.announce(nextFlagged ? `Question ${this.currentQuestionNumber} flagged.` : `Question ${this.currentQuestionNumber} unflagged.`);
    },
    isFlagged(questionId) {
      return Boolean(this.attempt.flags[questionId]);
    },
    openReview() {
      this.reviewMode = true;
      this.navOpen = true;
      this.persistAttempt();
      this.announce('Review mode opened.');
    },
    closeReview() {
      this.reviewMode = false;
      this.persistAttempt();
      this.announce(`Returned to question ${this.currentQuestionNumber}.`);
    },
    toggleNavPanel() {
      this.navOpen = !this.navOpen;
      this.announce(this.navOpen ? 'Question map opened.' : 'Question map closed.');

      if (this.navOpen) {
        this.$nextTick(() => {
          this.focusQuestionMapHeading();
        });
      }
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
    questionPromptSummary(question) {
      const prompt = typeof question?.prompt === 'string' ? question.prompt.trim().replace(/\s+/g, ' ') : '';

      if (!prompt) {
        return 'Question prompt unavailable';
      }

      const firstSentence = prompt.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || prompt;

      if (firstSentence.length <= QUESTION_NAV_LABEL_MAX_LENGTH) {
        return firstSentence;
      }

      return `${firstSentence.slice(0, QUESTION_NAV_LABEL_MAX_LENGTH - 1).trimEnd()}…`;
    },
    questionNavAriaLabel(question, index) {
      const parts = [
        `Question ${index + 1}`,
        this.questionPromptSummary(question),
        this.answeredLabel(question.id),
      ];

      if (this.isFlagged(question.id)) {
        parts.push('Flagged');
      }

      if (!this.reviewMode && this.attempt.currentIndex === index) {
        parts.push('Current question');
      }

      return parts.join('. ');
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
      this.setTransientMessage(fromTimer ? 'Your test was submitted automatically when the timer expired.' : 'Your test was submitted. Results are ready to review.');

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

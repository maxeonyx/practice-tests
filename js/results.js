import { attemptRecoveryNotice, announceLive, clearAttempt, clearLiveAnnouncement, consumeTransientMessage, createAppError, formatMarks, loadTest, navigateToTest, questionTypesLabel, readAttemptState, resolvePageError, scoreTest, secondaryHomeAction, shouldPreserveSkipLinkFocus, testParam } from './common.js?v=20260410-4';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      errorTitle: '',
      errorActions: [],
      liveMessage: '',
      test: null,
      attempt: null,
      summary: null,
      detailedResults: [],
      pendingRetakeConfirmation: false,
      announceTimerId: null,
      retakeConfirmTimerId: null,
    };
  },
  computed: {
    documentTitle() {
      if (!this.test) {
        return 'Practice Test Results';
      }

      return `Results — ${this.test.title}`;
    },
  },
  watch: {
    documentTitle: {
      immediate: true,
      handler(title) {
        document.title = title;
      },
    },
  },
  async mounted() {
    try {
      const testId = testParam();

      if (!testId) {
        throw createAppError('missing-test-id', 'Choose a test from the test list to view results.');
      }

      this.test = await loadTest(testId);
      const attemptState = readAttemptState(this.test);
      this.attempt = attemptState.attempt;

      if (attemptState.issue) {
        throw createAppError('invalid-saved-results', attemptRecoveryNotice(this.test, 'saved results'));
      }

      if (!this.attempt?.submitted) {
        throw createAppError('no-submitted-attempt', 'You do not have submitted results for this test on this device yet.');
      }

      const summary = scoreTest(this.test, this.attempt);
      this.summary = summary;
      this.detailedResults = summary.detailedResults;
      const transientMessage = consumeTransientMessage();
      if (transientMessage) {
        this.announce(transientMessage);
      } else {
        this.announce(`Loaded results for ${this.test.title}.`);
      }

      this.$nextTick(() => {
        if (shouldPreserveSkipLinkFocus()) {
          return;
        }

        this.$refs.resultsHeading?.focus();
      });
    } catch (error) {
      this.setErrorState(error);
    } finally {
      this.loading = false;

      if (this.error) {
        this.$nextTick(() => {
          if (shouldPreserveSkipLinkFocus()) {
            return;
          }

          this.focusErrorHeading();
        });
      }
    }
  },
  beforeUnmount() {
    clearLiveAnnouncement(this);
    this.clearRetakeConfirmation();
  },
  methods: {
    homeAction() {
      return secondaryHomeAction();
    },
    announce(message) {
      announceLive(this, message);
    },
    focusErrorHeading() {
      this.$refs.errorHeading?.focus();
    },
    formatMarks,
    typeLabel(type) {
      return questionTypesLabel(type);
    },
    resultLabel(item) {
      if (item.status === 'short-answer') {
        return 'Self-review';
      }

      if (item.status === 'partial') {
        return 'Partially Correct';
      }

      if (item.status === 'not-answered') {
        return 'Not answered';
      }

      return item.status === 'correct' ? 'Correct' : 'Incorrect';
    },
    resultPillClass(item) {
      if (item.status === 'short-answer') {
        return 'status-short-answer';
      }

      if (item.status === 'partial') {
        return 'status-partial';
      }

      if (item.status === 'not-answered') {
        return 'status-unanswered';
      }

      return item.status === 'correct' ? 'status-correct' : 'status-incorrect';
    },
    marksSummary(item) {
      if (item.status === 'short-answer') {
        return `${formatMarks(item.availableMarks)} marks self-review`;
      }

      return `${formatMarks(item.earnedPoints)} / ${formatMarks(item.maxPoints)} marks`;
    },
    retakeLabel() {
      return this.pendingRetakeConfirmation ? 'Are you sure?' : 'Retake Test';
    },
    retakeButtonClass() {
      return this.pendingRetakeConfirmation ? 'button-danger' : 'button-primary';
    },
    startRetakeConfirmation() {
      if (this.retakeConfirmTimerId) {
        window.clearTimeout(this.retakeConfirmTimerId);
      }

      this.pendingRetakeConfirmation = true;
      this.announce(`Retake confirmation enabled for ${this.test.title}. Activate again within 3 seconds to confirm.`);
      this.retakeConfirmTimerId = window.setTimeout(() => {
        this.pendingRetakeConfirmation = false;
        this.retakeConfirmTimerId = null;
      }, 3000);
    },
    clearRetakeConfirmation() {
      if (this.retakeConfirmTimerId) {
        window.clearTimeout(this.retakeConfirmTimerId);
      }

      this.pendingRetakeConfirmation = false;
      this.retakeConfirmTimerId = null;
    },
    retakeTest() {
      if (!this.pendingRetakeConfirmation) {
        this.startRetakeConfirmation();
        return;
      }

      this.clearRetakeConfirmation();
      clearAttempt(this.test.id);
      this.announce(`Saved attempt cleared for ${this.test.title}. Starting a new attempt.`);
      navigateToTest(this.test.id);
    },
    setErrorState(error) {
      const config = resolvePageError('results', error, this.test);
      this.errorTitle = config.title;
      this.error = config.message;
      this.errorActions = config.actions;
      this.announce(`${config.title}. ${config.message}`);
    },
  },
}).mount('#app');

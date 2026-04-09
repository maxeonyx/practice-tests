import { attemptRecoveryNotice, announceLive, clearAttempt, clearLiveAnnouncement, consumeTransientMessage, createAppError, formatMarks, homeUrl, loadTest, navigateToTest, questionTypesLabel, readAttemptState, scoreTest, shouldPreserveSkipLinkFocus, testParam, testUrl } from './common.js?v=20260410-1';

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
      const config = this.errorConfig(error);
      this.errorTitle = config.title;
      this.error = config.message;
      this.errorActions = config.actions;
      this.announce(`${config.title}. ${config.message}`);
    },
    errorConfig(error) {
      const actions = [
        {
          href: homeUrl(),
          label: 'Back to Tests',
          variant: 'button-primary',
        },
      ];

      if (this.test) {
        actions.push({
          href: testUrl(this.test.id),
          label: 'Start or Resume Test',
          variant: 'button-secondary',
        });
      }

      switch (error?.code) {
        case 'missing-test-id':
          return {
            title: 'Choose a test first',
            message: error.message,
            actions,
          };
        case 'test-not-found':
          return {
            title: 'Test not found',
            message: 'That results link no longer points to an available test. Choose a test from the list to continue.',
            actions: [actions[0]],
          };
        case 'no-submitted-attempt':
          return {
            title: 'No results saved yet',
            message: 'You do not have submitted results for this test on this device yet. You can go back to the test list or start the test now.',
            actions,
          };
        case 'invalid-saved-results':
          return {
            title: 'Saved results could not be restored',
            message: `${error.message} You can start the test again from the test list.`,
            actions,
          };
        case 'test-unavailable':
        case 'catalog-unavailable':
          return {
            title: 'We couldn’t load these results',
            message: error.message,
            actions,
          };
        default:
          return {
            title: 'Something went wrong',
            message: 'We couldn’t load this results page. Go back to the test list and try again.',
            actions,
          };
      }
    },
  },
}).mount('#app');

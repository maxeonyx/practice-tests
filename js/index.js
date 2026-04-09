import { announceLive, attemptRecoveryNotice, clearAttempt, clearLiveAnnouncement, loadCatalog, readAttemptState, resolvePageError, resultsUrl, testUrl } from './common.js?v=20260410-4';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      errorTitle: '',
      liveMessage: '',
      tests: [],
      attemptStates: {},
      recoveryNotices: [],
      announceTimerId: null,
      pendingResetTestId: null,
      resetConfirmTimerId: null,
    };
  },
  async mounted() {
    try {
      const catalog = await loadCatalog();
      this.tests = catalog.tests;
      this.tests.forEach((test) => {
        const attemptState = readAttemptState(test);
        this.attemptStates[test.id] = attemptState.attempt;

        if (attemptState.issue) {
          this.recoveryNotices.push(attemptRecoveryNotice(test, 'saved progress'));
        }
      });

      if (this.recoveryNotices.length > 0) {
        this.announce('Some saved progress on this device could not be restored and was cleared.');
      }
    } catch (error) {
      const errorState = resolvePageError('index', error);
      this.errorTitle = errorState.title;
      this.error = errorState.message;
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount() {
    clearLiveAnnouncement(this);
    this.clearResetConfirmation();
  },
  methods: {
    announce(message) {
      announceLive(this, message);
    },
    testTitle(testId) {
      return this.tests.find((test) => test.id === testId)?.title || 'this test';
    },
    formatTypes(types) {
      return types.join(', ');
    },
    stateFor(testId) {
      const attempt = this.attemptStates[testId];

      if (!attempt) {
        return null;
      }

      if (attempt.submitted) {
        return {
          label: 'Completed attempt available',
          detail: 'You can review results or reset and retake the test.',
        };
      }

      return {
        label: 'Saved progress found',
        detail: 'Resume your in-progress attempt from where you left off.',
      };
    },
    primaryLink(testId) {
      const attempt = this.attemptStates[testId];

      if (attempt?.submitted) {
        return resultsUrl(testId);
      }

      return testUrl(testId);
    },
    primaryLabel(testId) {
      const attempt = this.attemptStates[testId];

      if (!attempt) {
        return 'Start Test';
      }

      return attempt.submitted ? 'View Results' : 'Resume Test';
    },
    canReset(testId) {
      return Boolean(this.attemptStates[testId]);
    },
    isResetPending(testId) {
      return this.pendingResetTestId === testId;
    },
    secondaryLabel(testId) {
      if (this.isResetPending(testId)) {
        return 'Are you sure?';
      }

      return this.attemptStates[testId]?.submitted ? 'Retake' : 'Reset Attempt';
    },
    secondaryButtonClass(testId) {
      return this.isResetPending(testId) ? 'button-danger' : 'button-secondary';
    },
    startResetConfirmation(testId) {
      if (this.resetConfirmTimerId) {
        window.clearTimeout(this.resetConfirmTimerId);
      }

      this.pendingResetTestId = testId;
      this.announce(`Reset confirmation enabled for ${this.testTitle(testId)}. Activate again within 3 seconds to confirm.`);
      this.resetConfirmTimerId = window.setTimeout(() => {
        if (this.pendingResetTestId === testId) {
          this.pendingResetTestId = null;
        }

        this.resetConfirmTimerId = null;
      }, 3000);
    },
    clearResetConfirmation() {
      if (this.resetConfirmTimerId) {
        window.clearTimeout(this.resetConfirmTimerId);
      }

      this.pendingResetTestId = null;
      this.resetConfirmTimerId = null;
    },
    resetAttempt(testId) {
      if (!this.isResetPending(testId)) {
        this.startResetConfirmation(testId);
        return;
      }

      this.clearResetConfirmation();
      clearAttempt(testId);
      this.attemptStates[testId] = null;
      this.announce(`Cleared saved attempt for ${this.testTitle(testId)}.`);
    },
  },
}).mount('#app');

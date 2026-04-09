import { announceLive, clearAttempt, clearLiveAnnouncement, clearTimedConfirmation, getAttempt, loadCatalog, startTimedConfirmation } from './common.js?v=20260410-1';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      liveMessage: '',
      tests: [],
      attemptStates: {},
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
        this.attemptStates[test.id] = getAttempt(test);
      });
    } catch (error) {
      this.error = error.message;
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
        return `results.html?test=${encodeURIComponent(testId)}`;
      }

      return `test.html?test=${encodeURIComponent(testId)}`;
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
      startTimedConfirmation(this, {
        pendingKey: 'pendingResetTestId',
        timerKey: 'resetConfirmTimerId',
        value: testId,
        message: `Reset confirmation enabled for ${this.testTitle(testId)}. Activate again within 3 seconds to confirm.`,
      });
    },
    clearResetConfirmation() {
      clearTimedConfirmation(this, {
        pendingKey: 'pendingResetTestId',
        timerKey: 'resetConfirmTimerId',
      });
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

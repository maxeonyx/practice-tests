import { clearAttempt, getAttempt, loadCatalog } from './common.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      tests: [],
      attemptStates: {},
    };
  },
  async mounted() {
    try {
      const catalog = await loadCatalog();
      this.tests = catalog.tests;
      this.tests.forEach((test) => {
        this.attemptStates[test.id] = getAttempt(test.id);
      });
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
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

      return attempt.submitted ? 'Review Results' : 'Resume Test';
    },
    hasSubmitted(testId) {
      return Boolean(this.attemptStates[testId]?.submitted);
    },
    canReset(testId) {
      return Boolean(this.attemptStates[testId]);
    },
    resetAttempt(testId) {
      clearAttempt(testId);
      this.attemptStates[testId] = null;
    },
  },
}).mount('#app');

import { clearAttempt, loadTest, questionTypesLabel, scoreTest, testParam, getAttempt } from './common.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      test: null,
      attempt: null,
      summary: null,
      detailedResults: [],
    };
  },
  async mounted() {
    try {
      const testId = testParam();

      if (!testId) {
        throw new Error('No test id was provided. Start from the landing page.');
      }

      this.test = await loadTest(testId);
      this.attempt = getAttempt(this.test);

      if (!this.attempt?.submitted) {
        throw new Error('No submitted attempt was found for this test yet.');
      }

      const summary = scoreTest(this.test, this.attempt);
      this.summary = summary;
      this.detailedResults = summary.detailedResults;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    typeLabel(type) {
      return questionTypesLabel(type);
    },
    resultLabel(item) {
      if (item.status === 'short-answer') {
        return 'Self-review';
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

      if (item.status === 'not-answered') {
        return 'status-unanswered';
      }

      return item.status === 'correct' ? 'status-correct' : 'status-incorrect';
    },
    retakeTest() {
      const confirmed = window.confirm('This will remove the saved results for this attempt and start a new attempt. Continue?');

      if (!confirmed) {
        return;
      }

      clearAttempt(this.test.id);
      window.location.href = `test.html?test=${encodeURIComponent(this.test.id)}`;
    },
  },
}).mount('#app');

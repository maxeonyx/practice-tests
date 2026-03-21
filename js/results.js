import { clearAttempt, formatMarks, getAttempt, loadTest, questionTypesLabel, scoreTest, testParam } from './common.js';

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

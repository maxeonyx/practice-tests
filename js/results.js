import { announceLive, clearAttempt, clearLiveAnnouncement, consumeTransientMessage, formatMarks, getAttempt, loadTest, questionTypesLabel, scoreTest, shouldPreserveSkipLinkFocus, testParam } from './common.js?v=20260409-9';

const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
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
      this.error = error.message;
    } finally {
      this.loading = false;
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
      window.location.href = `test.html?test=${encodeURIComponent(this.test.id)}`;
    },
  },
}).mount('#app');

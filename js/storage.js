/**
 * Storage Manager Module
 * Handles all Local Storage operations for the application
 */

const Storage = (() => {
  const STORAGE_VERSION = '1.0';
  const STORAGE_PREFIX = 'il_driver_test_';

  // Private methods
  const getStorageKey = (key) => `${STORAGE_PREFIX}${key}`;

  const initializeUser = () => {
    return {
      name: '',
      createdAt: Date.now(),
      lastVisit: Date.now()
    };
  };

  const initializeQuestionHistory = () => {
    return {};
  };

  const initializeStats = () => {
    return {
      totalAttempts: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      testsTaken: 0,
      longestStreak: 0,
      currentStreak: 0,
      questionsMastered: 0,
      categoryBreakdown: {}
    };
  };

  // Public API
  return {
    /**
     * Get user profile
     */
    getUser() {
      try {
        const user = localStorage.getItem(getStorageKey('user'));
        return user ? JSON.parse(user) : null;
      } catch (e) {
        console.error('Error retrieving user:', e);
        return null;
      }
    },

    /**
     * Save user profile
     */
    setUser(userData) {
      try {
        const user = this.getUser() || initializeUser();
        const updated = { ...user, ...userData, lastVisit: Date.now() };
        localStorage.setItem(getStorageKey('user'), JSON.stringify(updated));
        return updated;
      } catch (e) {
        console.error('Error saving user:', e);
        return null;
      }
    },

    /**
     * Get all question history
     */
    getQuestionHistory() {
      try {
        const history = localStorage.getItem(getStorageKey('questionHistory'));
        return history ? JSON.parse(history) : {};
      } catch (e) {
        console.error('Error retrieving question history:', e);
        return {};
      }
    },

    /**
     * Get history for a specific question
     */
    getQuestionRecord(questionId) {
      const history = this.getQuestionHistory();
      return history[questionId] || {
        attempts: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastAttempt: null,
        consecutiveCorrect: 0,
        mastered: false,
        firstAttemptCorrect: null
      };
    },

    /**
     * Update question history with answer result
     */
    updateQuestionRecord(questionId, isCorrect) {
      try {
        const history = this.getQuestionHistory();
        const record = this.getQuestionRecord(questionId);

        record.attempts++;
        record.lastAttempt = Date.now();

        if (isCorrect) {
          record.correctCount++;
          record.consecutiveCorrect++;
          // Mark mastered after 2 consecutive correct answers
          if (record.consecutiveCorrect >= 2) {
            record.mastered = true;
          }
        } else {
          record.incorrectCount++;
          record.consecutiveCorrect = 0;
          record.mastered = false;
        }

        // Track first attempt correctness
        if (record.attempts === 1) {
          record.firstAttemptCorrect = isCorrect;
        }

        history[questionId] = record;
        localStorage.setItem(getStorageKey('questionHistory'), JSON.stringify(history));
        return record;
      } catch (e) {
        console.error('Error updating question record:', e);
        return null;
      }
    },

    /**
     * Get statistics
     */
    getStats() {
      try {
        const stats = localStorage.getItem(getStorageKey('stats'));
        return stats ? JSON.parse(stats) : initializeStats();
      } catch (e) {
        console.error('Error retrieving stats:', e);
        return initializeStats();
      }
    },

    /**
     * Update statistics after completing a question
     */
    updateStats(isCorrect, category) {
      try {
        const stats = this.getStats();

        stats.totalAttempts++;
        if (isCorrect) {
          stats.totalCorrect++;
          stats.currentStreak++;
          stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        } else {
          stats.totalIncorrect++;
          stats.currentStreak = 0;
        }

        // Update category breakdown
        if (category) {
          if (!stats.categoryBreakdown[category]) {
            stats.categoryBreakdown[category] = {
              attempts: 0,
              correct: 0,
              mastered: 0
            };
          }
          stats.categoryBreakdown[category].attempts++;
          if (isCorrect) {
            stats.categoryBreakdown[category].correct++;
          }
        }

        localStorage.setItem(getStorageKey('stats'), JSON.stringify(stats));
        return stats;
      } catch (e) {
        console.error('Error updating stats:', e);
        return null;
      }
    },

    /**
     * Update mastery count in stats
     */
    updateMasteryStats() {
      try {
        const history = this.getQuestionHistory();
        const masteredCount = Object.values(history).filter(r => r.mastered).length;

        const stats = this.getStats();
        stats.questionsMastered = masteredCount;

        // Update category mastery counts
        const questions = QuestionManager.getAllQuestions();
        const categoryStats = {};

        questions.forEach(q => {
          const record = history[q.id];
          if (record && record.mastered) {
            if (!categoryStats[q.category]) {
              categoryStats[q.category] = 0;
            }
            categoryStats[q.category]++;
          }
        });

        Object.keys(categoryStats).forEach(cat => {
          if (stats.categoryBreakdown[cat]) {
            stats.categoryBreakdown[cat].mastered = categoryStats[cat];
          }
        });

        localStorage.setItem(getStorageKey('stats'), JSON.stringify(stats));
        return stats;
      } catch (e) {
        console.error('Error updating mastery stats:', e);
        return null;
      }
    },

    /**
     * Get current session data
     */
    getCurrentSession() {
      try {
        const session = localStorage.getItem(getStorageKey('currentSession'));
        return session ? JSON.parse(session) : null;
      } catch (e) {
        console.error('Error retrieving session:', e);
        return null;
      }
    },

    /**
     * Save current session
     */
    setCurrentSession(sessionData) {
      try {
        localStorage.setItem(getStorageKey('currentSession'), JSON.stringify(sessionData));
        return sessionData;
      } catch (e) {
        console.error('Error saving session:', e);
        return null;
      }
    },

    /**
     * Clear current session
     */
    clearCurrentSession() {
      try {
        localStorage.removeItem(getStorageKey('currentSession'));
        return true;
      } catch (e) {
        console.error('Error clearing session:', e);
        return false;
      }
    },

    /**
     * Get missed questions (incorrect answers that aren't mastered)
     */
    getMissedQuestions() {
      const history = this.getQuestionHistory();
      const missedIds = Object.keys(history).filter(id => {
        const record = history[id];
        return record.incorrectCount > 0 && !record.mastered;
      });
      return missedIds.map(Number);
    },

    /**
     * Get questions ready for review (with incorrect attempts)
     */
    getReviewQueue() {
      return this.getMissedQuestions();
    },

    /**
     * Get mastered questions
     */
    getMasteredQuestions() {
      const history = this.getQuestionHistory();
      return Object.keys(history)
        .filter(id => history[id].mastered)
        .map(Number);
    },

    /**
     * Reset all data (with confirmation)
     */
    resetAllData() {
      try {
        localStorage.removeItem(getStorageKey('user'));
        localStorage.removeItem(getStorageKey('questionHistory'));
        localStorage.removeItem(getStorageKey('stats'));
        localStorage.removeItem(getStorageKey('currentSession'));
        return true;
      } catch (e) {
        console.error('Error resetting data:', e);
        return false;
      }
    },

    /**
     * Export all data
     */
    exportData() {
      return {
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        user: this.getUser(),
        questionHistory: this.getQuestionHistory(),
        stats: this.getStats()
      };
    },

    /**
     * Import data
     */
    importData(data) {
      try {
        if (data.user) {
          localStorage.setItem(getStorageKey('user'), JSON.stringify(data.user));
        }
        if (data.questionHistory) {
          localStorage.setItem(getStorageKey('questionHistory'), JSON.stringify(data.questionHistory));
        }
        if (data.stats) {
          localStorage.setItem(getStorageKey('stats'), JSON.stringify(data.stats));
        }
        return true;
      } catch (e) {
        console.error('Error importing data:', e);
        return false;
      }
    }
  };
})();

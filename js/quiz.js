/**
 * Quiz Controller Module
 * Handles quiz state and logic
 */

const Quiz = (() => {
  let currentSession = null;

  return {
    /**
     * Initialize a new practice test session
     */
    initializePracticeTest(excludeMastered = false) {
      const questions = QuestionManager.selectPracticeQuestions(excludeMastered);

      currentSession = {
        mode: 'practice',
        startTime: Date.now(),
        questions: questions.map(q => q.id),
        currentIndex: 0,
        responses: [],
        sessionStats: {
          correct: 0,
          incorrect: 0
        }
      };

      Storage.setCurrentSession(currentSession);
      return currentSession;
    },

    /**
     * Initialize a review mode session (missed questions)
     */
    initializeReviewMode() {
      const reviewQuestions = QuestionManager.getReviewQueue();

      if (reviewQuestions.length === 0) {
        return null;
      }

      currentSession = {
        mode: 'review',
        startTime: Date.now(),
        questions: reviewQuestions.map(q => q.id),
        currentIndex: 0,
        responses: [],
        sessionStats: {
          correct: 0,
          incorrect: 0
        }
      };

      Storage.setCurrentSession(currentSession);
      return currentSession;
    },

    /**
     * Resume existing session
     */
    resumeSession() {
      currentSession = Storage.getCurrentSession();
      return currentSession;
    },

    /**
     * Get current session
     */
    getCurrentSession() {
      return currentSession;
    },

    /**
     * Get current question
     */
    getCurrentQuestion() {
      if (!currentSession || currentSession.currentIndex >= currentSession.questions.length) {
        return null;
      }
      const questionId = currentSession.questions[currentSession.currentIndex];
      return QuestionManager.getQuestion(questionId);
    },

    /**
     * Get current question index (0-based)
     */
    getCurrentIndex() {
      return currentSession?.currentIndex || 0;
    },

    /**
     * Get total questions in session
     */
    getTotalQuestions() {
      return currentSession?.questions.length || 0;
    },

    /**
     * Submit an answer
     */
    submitAnswer(userAnswer) {
      if (!currentSession) {
        console.error('No active session');
        return null;
      }

      const currentQuestion = this.getCurrentQuestion();
      if (!currentQuestion) {
        console.error('No current question');
        return null;
      }

      const isCorrect = userAnswer === currentQuestion.correct_answer;

      // Record response
      const response = {
        questionId: currentQuestion.id,
        userAnswer,
        correct: isCorrect,
        timestamp: Date.now()
      };

      currentSession.responses.push(response);

      // Update session stats
      if (isCorrect) {
        currentSession.sessionStats.correct++;
      } else {
        currentSession.sessionStats.incorrect++;
      }

      // Update storage
      Storage.updateQuestionRecord(currentQuestion.id, isCorrect);
      Storage.updateStats(isCorrect, currentQuestion.category);
      Storage.setCurrentSession(currentSession);

      return {
        isCorrect,
        explanation: currentQuestion.explanation,
        correctAnswer: currentQuestion.correct_answer,
        category: currentQuestion.category
      };
    },

    /**
     * Move to next question
     */
    nextQuestion() {
      if (!currentSession) {
        return false;
      }

      if (currentSession.currentIndex < currentSession.questions.length - 1) {
        currentSession.currentIndex++;
        Storage.setCurrentSession(currentSession);
        return true;
      }

      return false;
    },

    /**
     * Check if session is complete
     */
    isSessionComplete() {
      if (!currentSession) {
        return true;
      }
      return currentSession.currentIndex >= currentSession.questions.length - 1;
    },

    /**
     * Get session results
     */
    getSessionResults() {
      if (!currentSession) {
        return null;
      }

      const total = currentSession.questions.length;
      const correct = currentSession.sessionStats.correct;
      const percentage = Math.round((correct / total) * 100);

      // Categorize responses
      const resultsByCategory = {};
      currentSession.responses.forEach(response => {
        const question = QuestionManager.getQuestion(response.questionId);
        if (!resultsByCategory[question.category]) {
          resultsByCategory[question.category] = {
            attempted: 0,
            correct: 0
          };
        }
        resultsByCategory[question.category].attempted++;
        if (response.correct) {
          resultsByCategory[question.category].correct++;
        }
      });

      return {
        total,
        correct,
        incorrect: total - correct,
        percentage,
        resultsByCategory,
        duration: Date.now() - currentSession.startTime,
        mode: currentSession.mode
      };
    },

    /**
     * End session and clear
     */
    endSession() {
      // Update mastery stats
      Storage.updateMasteryStats();

      currentSession = null;
      Storage.clearCurrentSession();
      return true;
    },

    /**
     * Abandon session
     */
    abandonSession() {
      currentSession = null;
      Storage.clearCurrentSession();
      return true;
    },

    /**
     * Get unanswered questions
     */
    getUnansweredQuestions() {
      if (!currentSession) {
        return [];
      }

      const answeredIds = new Set(currentSession.responses.map(r => r.questionId));
      return currentSession.questions.filter(id => !answeredIds.has(id));
    }
  };
})();

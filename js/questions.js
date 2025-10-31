/**
 * Question Manager Module
 * Handles question bank loading and filtering
 */

const QuestionManager = (() => {
  let questions = [];
  let isLoaded = false;

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return {
    /**
     * Load questions from JSON file
     */
    async loadQuestions() {
      try {
        const response = await fetch('./data/qna.json');
        const data = await response.json();
        questions = data.illinois_permit_test_questions || [];
        isLoaded = true;
        return true;
      } catch (e) {
        console.error('Error loading questions:', e);
        isLoaded = false;
        return false;
      }
    },

    /**
     * Check if questions are loaded
     */
    isLoaded() {
      return isLoaded;
    },

    /**
     * Get all questions
     */
    getAllQuestions() {
      return [...questions];
    },

    /**
     * Get question by ID
     */
    getQuestion(questionId) {
      return questions.find(q => q.id === questionId);
    },

    /**
     * Get all unique categories
     */
    getCategories() {
      const categories = new Set(questions.map(q => q.category));
      return Array.from(categories).sort();
    },

    /**
     * Get questions by category
     */
    getQuestionsByCategory(category) {
      return questions.filter(q => q.category === category);
    },

    /**
     * Get questions excluding mastered ones
     */
    getUnmasteredQuestions() {
      const mastereds = Storage.getMasteredQuestions();
      return questions.filter(q => !mastereds.includes(q.id));
    },

    /**
     * Select 35 random questions for a practice test
     * Prioritizes questions with fewer attempts when possible
     */
    selectPracticeQuestions(excludeMastered = false) {
      let candidateQuestions = excludeMastered ? this.getUnmasteredQuestions() : questions;

      // If we have fewer than 35 questions, return all
      if (candidateQuestions.length <= 35) {
        return shuffleArray(candidateQuestions);
      }

      // Sort by attempt count (prioritize questions with fewer attempts)
      const sortedByAttempts = candidateQuestions.sort((a, b) => {
        const recordA = Storage.getQuestionRecord(a.id);
        const recordB = Storage.getQuestionRecord(b.id);
        return recordA.attempts - recordB.attempts;
      });

      // Select 35 questions: mix from low-attempt and random
      const selected = [];
      const lowAttemptQuestions = sortedByAttempts.slice(0, 20);
      const otherQuestions = sortedByAttempts.slice(20);

      selected.push(...lowAttemptQuestions);
      selected.push(...shuffleArray(otherQuestions).slice(0, 15));

      return shuffleArray(selected);
    },

    /**
     * Get review queue (missed questions)
     */
    getReviewQueue() {
      const missedIds = Storage.getReviewQueue();
      return missedIds.map(id => this.getQuestion(id)).filter(q => q);
    },

    /**
     * Get questions by type
     */
    getQuestionsByType(type) {
      return questions.filter(q => q.type === type);
    },

    /**
     * Get total question count
     */
    getTotalCount() {
      return questions.length;
    }
  };
})();

/**
 * UI Manager Module
 * Handles all UI rendering and updates
 */

const UI = (() => {
  /**
   * Hide all screens
   */
  const hideAllScreens = () => {
    document.querySelectorAll('[data-screen]').forEach(screen => {
      screen.classList.add('hidden');
    });
  };

  /**
   * Show specific screen
   */
  const showScreen = (screenName) => {
    hideAllScreens();
    const screen = document.querySelector(`[data-screen="${screenName}"]`);
    if (screen) {
      screen.classList.remove('hidden');
    }
  };

  return {
    /**
     * Initialize welcome screen
     */
    showWelcomeScreen() {
      showScreen('welcome');
      const input = document.querySelector('#nameInput');
      if (input) {
        input.focus();
      }
    },

    /**
     * Show dashboard/home
     */
    showDashboard() {
      showScreen('dashboard');
      this.updateDashboard();
    },

    /**
     * Update dashboard with user data
     */
    updateDashboard() {
      const user = Storage.getUser();
      const stats = Storage.getStats();
      const total = QuestionManager.getTotalCount();
      const masteredCount = Storage.getMasteredQuestions().length;
      const missedCount = Storage.getMissedQuestions().length;

      // Update greeting
      const greetingEl = document.querySelector('#greeting');
      if (greetingEl && user) {
        greetingEl.textContent = `Welcome back, ${user.name}!`;
      }

      // Update stats display
      const accuracy = stats.totalAttempts > 0
        ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
        : 0;

      const statsEl = document.querySelector('#dashboardStats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div class="stat-card">
            <div class="stat-label">Questions Attempted</div>
            <div class="stat-value">${stats.totalAttempts}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value">${accuracy}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Mastered</div>
            <div class="stat-value">${masteredCount}/${total}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">${stats.currentStreak}</div>
          </div>
        `;
      }

      // Update progress bar
      const progressPercent = (masteredCount / total) * 100;
      const progressBar = document.querySelector('#progressBar');
      if (progressBar) {
        Animations.bounceProgressBar(progressBar, progressPercent);
      }

      const progressText = document.querySelector('#progressText');
      if (progressText) {
        progressText.textContent = `${masteredCount}/${total} questions mastered`;
      }

      // Show/hide review button
      const reviewBtn = document.querySelector('#reviewBtn');
      if (reviewBtn) {
        reviewBtn.style.display = missedCount > 0 ? 'block' : 'none';
        if (missedCount > 0) {
          reviewBtn.textContent = `Review Missed Questions (${missedCount})`;
        }
      }
    },

    /**
     * Show practice test screen
     */
    showPracticeTest() {
      showScreen('practice-test');
      this.updateQuestionDisplay();
    },

    /**
     * Update question display
     */
    updateQuestionDisplay() {
      const question = Quiz.getCurrentQuestion();
      const currentIndex = Quiz.getCurrentIndex();
      const total = Quiz.getTotalQuestions();

      if (!question) {
        this.showTestComplete();
        return;
      }

      // Update progress
      const progressEl = document.querySelector('#questionProgress');
      if (progressEl) {
        progressEl.textContent = `Question ${currentIndex + 1} of ${total}`;
      }

      // Update progress bar
      const progressBar = document.querySelector('#testProgressBar');
      if (progressBar) {
        const percent = ((currentIndex + 1) / total) * 100;
        progressBar.style.width = percent + '%';
      }

      // Update category badge
      const categoryEl = document.querySelector('#categoryBadge');
      if (categoryEl) {
        categoryEl.textContent = question.category;
      }

      // Update question text
      const questionEl = document.querySelector('#questionText');
      if (questionEl) {
        questionEl.textContent = question.question;
      }

      // Render answer options
      const optionsContainer = document.querySelector('#optionsContainer');
      if (optionsContainer) {
        optionsContainer.innerHTML = '';

        if (question.type === 'multiple_choice') {
          question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-option';
            btn.textContent = option;
            btn.value = String.fromCharCode(97 + index); // a, b, c, d
            btn.onclick = () => this.handleAnswerSelect(btn.value);
            optionsContainer.appendChild(btn);
          });
        } else if (question.type === 'true_false') {
          const trueBtn = document.createElement('button');
          trueBtn.className = 'answer-option';
          trueBtn.textContent = 'True';
          trueBtn.value = 'true';
          trueBtn.onclick = () => this.handleAnswerSelect('true');
          optionsContainer.appendChild(trueBtn);

          const falseBtn = document.createElement('button');
          falseBtn.className = 'answer-option';
          falseBtn.textContent = 'False';
          falseBtn.value = 'false';
          falseBtn.onclick = () => this.handleAnswerSelect('false');
          optionsContainer.appendChild(falseBtn);
        }
      }

      // Hide feedback initially
      const feedbackEl = document.querySelector('#feedbackContainer');
      if (feedbackEl) {
        feedbackEl.classList.add('hidden');
      }

      // Disable next button
      const nextBtn = document.querySelector('#nextBtn');
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
      }
    },

    /**
     * Handle answer selection
     */
    handleAnswerSelect(answer) {
      const result = Quiz.submitAnswer(answer);
      this.showAnswerFeedback(result);
    },

    /**
     * Show answer feedback
     */
    showAnswerFeedback(result) {
      const feedbackEl = document.querySelector('#feedbackContainer');
      if (!feedbackEl) return;

      feedbackEl.classList.remove('hidden');

      if (result.isCorrect) {
        feedbackEl.className = 'feedback-container correct';
        feedbackEl.innerHTML = `
          <div class="feedback-message">
            <div class="checkmark">✓</div>
            <div class="feedback-text">Excellent! You got it!</div>
          </div>
          <div class="explanation">${result.explanation}</div>
        `;

        const answerOptionsContainer = document.querySelector('#optionsContainer');
        if (answerOptionsContainer) {
          Animations.celebrateCorrect(answerOptionsContainer.parentElement);
        }

        // Check for streaks or mastery
        const question = Quiz.getCurrentQuestion();
        const record = Storage.getQuestionRecord(question.id);

        if (record.mastered) {
          const masteryMsg = document.createElement('div');
          masteryMsg.className = 'mastery-message';
          masteryMsg.textContent = '🎉 Question Mastered!';
          feedbackEl.appendChild(masteryMsg);
          Animations.celebrateMastery(feedbackEl);
        }
      } else {
        feedbackEl.className = 'feedback-container incorrect';
        feedbackEl.innerHTML = `
          <div class="feedback-message">
            <div class="x-mark">✗</div>
            <div class="feedback-text">Not quite, but you're learning!</div>
          </div>
          <div class="explanation">
            <strong>Correct answer:</strong> ${result.correctAnswer}
            <br><br>
            ${result.explanation}
          </div>
        `;

        Animations.reactionIncorrect(feedbackEl);
      }

      // Disable answer options
      document.querySelectorAll('.answer-option').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
      });

      // Enable next button
      const nextBtn = document.querySelector('#nextBtn');
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
        nextBtn.focus();
      }
    },

    /**
     * Show test complete screen
     */
    showTestComplete() {
      showScreen('test-complete');
      this.displayTestResults();
    },

    /**
     * Display test results
     */
    displayTestResults() {
      const results = Quiz.getSessionResults();
      if (!results) return;

      const resultsEl = document.querySelector('#testResults');
      if (resultsEl) {
        const resultMessage = this.getResultMessage(results.percentage);

        resultsEl.innerHTML = `
          <div class="results-summary">
            <div class="score-circle">
              <div class="score-percentage">${results.percentage}%</div>
              <div class="score-text">Accuracy</div>
            </div>
            <div class="score-breakdown">
              <div class="score-line">
                <span>${results.correct} out of ${results.total} correct</span>
              </div>
              <div class="result-message">${resultMessage}</div>
            </div>
          </div>
        `;
      }

      // Category breakdown
      const categoryEl = document.querySelector('#categoryBreakdown');
      if (categoryEl && results.resultsByCategory) {
        categoryEl.innerHTML = '<h3>By Category:</h3>';
        Object.entries(results.resultsByCategory).forEach(([category, stats]) => {
          const percent = Math.round((stats.correct / stats.attempted) * 100);
          const categoryDiv = document.createElement('div');
          categoryDiv.className = 'category-result';
          categoryDiv.innerHTML = `
            <span>${category}</span>
            <span>${stats.correct}/${stats.attempted} (${percent}%)</span>
          `;
          categoryEl.appendChild(categoryDiv);
        });
      }
    },

    /**
     * Get encouraging message based on performance
     */
    getResultMessage(percentage) {
      if (percentage === 100) {
        return "Perfect score! You're crushing it! 🌟";
      } else if (percentage >= 90) {
        return "Excellent work! You really know this stuff! 🎉";
      } else if (percentage >= 80) {
        return "Great job! Keep practicing and you'll master this! 💪";
      } else if (percentage >= 70) {
        return "Good effort! You're making progress! 📈";
      } else {
        return "Keep practicing! Every attempt helps you learn! 📚";
      }
    },

    /**
     * Show review mode screen
     */
    showReviewMode() {
      const reviewQuestions = QuestionManager.getReviewQueue();
      if (reviewQuestions.length === 0) {
        alert('Great job! You have no missed questions to review.');
        this.showDashboard();
        return;
      }

      showScreen('review-mode');
      const headerEl = document.querySelector('#reviewHeader');
      if (headerEl) {
        headerEl.textContent = `Let's Master These Questions! (${reviewQuestions.length} to review)`;
      }
      this.updateQuestionDisplay();
    },

    /**
     * Navigate to next question
     */
    nextQuestion() {
      if (Quiz.nextQuestion()) {
        this.updateQuestionDisplay();
      } else if (Quiz.isSessionComplete()) {
        this.showTestComplete();
      }
    },

    /**
     * Update category stats display
     */
    updateCategoryStats() {
      const stats = Storage.getStats();
      const categories = QuestionManager.getCategories();

      const categoryStatsEl = document.querySelector('#categoryStats');
      if (!categoryStatsEl) return;

      categoryStatsEl.innerHTML = '';
      categories.forEach(category => {
        const catStats = stats.categoryBreakdown[category];
        if (!catStats) return;

        const percent = catStats.attempts > 0
          ? Math.round((catStats.correct / catStats.attempts) * 100)
          : 0;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-stat';
        categoryDiv.innerHTML = `
          <div class="category-name">${category}</div>
          <div class="category-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="category-percent">${percent}%</div>
          </div>
          <div class="category-details">${catStats.correct}/${catStats.attempts} correct</div>
        `;
        categoryStatsEl.appendChild(categoryDiv);
      });
    },

    /**
     * Show settings screen
     */
    showSettings() {
      showScreen('settings');
      this.updateSettingsDisplay();
    },

    /**
     * Update settings display
     */
    updateSettingsDisplay() {
      const user = Storage.getUser();
      const nameInput = document.querySelector('#settingsNameInput');
      if (nameInput && user) {
        nameInput.value = user.name;
      }

      const exportBtn = document.querySelector('#exportBtn');
      if (exportBtn) {
        exportBtn.onclick = () => this.exportData();
      }

      const resetBtn = document.querySelector('#resetBtn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            Storage.resetAllData();
            location.reload();
          }
        };
      }
    },

    /**
     * Export data as JSON file
     */
    exportData() {
      const data = Storage.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `driver-test-progress-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    },

    /**
     * Navigate between screens
     */
    navigate(screenName) {
      switch (screenName) {
        case 'dashboard':
          this.showDashboard();
          break;
        case 'practice':
          Quiz.initializePracticeTest();
          this.showPracticeTest();
          break;
        case 'review':
          Quiz.initializeReviewMode();
          if (Quiz.getCurrentSession()) {
            this.showReviewMode();
          } else {
            this.showDashboard();
          }
          break;
        case 'settings':
          this.showSettings();
          break;
        default:
          this.showDashboard();
      }
    },

    /**
     * Show loading state
     */
    showLoading() {
      const loadingEl = document.querySelector('#loading');
      if (loadingEl) {
        loadingEl.classList.remove('hidden');
      }
    },

    /**
     * Hide loading state
     */
    hideLoading() {
      const loadingEl = document.querySelector('#loading');
      if (loadingEl) {
        loadingEl.classList.add('hidden');
      }
    },

    /**
     * Show error message
     */
    showError(message) {
      const errorEl = document.createElement('div');
      errorEl.className = 'error-notification';
      errorEl.textContent = message;
      document.body.appendChild(errorEl);

      setTimeout(() => {
        errorEl.classList.add('show');
      }, 10);

      setTimeout(() => {
        errorEl.classList.remove('show');
        setTimeout(() => errorEl.remove(), 300);
      }, 3000);
    }
  };
})();

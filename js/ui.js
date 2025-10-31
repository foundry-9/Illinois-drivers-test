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

      // Update greeting with encouraging message
      const greetingEl = document.querySelector('#greeting');
      if (greetingEl && user) {
        const greeting = Messages.getGreeting(user.name);
        greetingEl.textContent = `${greeting.emoji} ${greeting.message}`;
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

      // Update achievements display
      this.updateAchievementsDisplay();

      // Update category stats
      this.updateCategoryStats();
    },

    /**
     * Update achievements display
     */
    updateAchievementsDisplay() {
      if (!Achievements) return;

      const progress = Achievements.getProgress();
      const progressEl = document.querySelector('#achievementProgress');
      if (progressEl) {
        progressEl.innerHTML = `
          <div class="progress-stat">
            <span>${progress.earned}/${progress.total}</span>
            <div class="mini-progress-bar">
              <div class="mini-progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
          </div>
        `;
      }

      const earnedAchievements = Achievements.getEarnedAchievements();
      const achievementsListEl = document.querySelector('#achievementsList');
      if (achievementsListEl) {
        if (earnedAchievements.length === 0) {
          achievementsListEl.innerHTML = '<p class="no-achievements">Start practicing to earn achievements!</p>';
        } else {
          achievementsListEl.innerHTML = earnedAchievements
            .map(achievement => `
              <div class="achievement-badge earned">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                  <div class="achievement-name">${achievement.name}</div>
                  <div class="achievement-description">${achievement.description}</div>
                </div>
              </div>
            `)
            .join('');
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
        // Get encouraging message for correct answer
        const correctMsg = Messages.getCorrectMessage();

        feedbackEl.className = 'feedback-container correct';
        feedbackEl.innerHTML = `
          <div class="feedback-message">
            <div class="checkmark">✓</div>
            <div class="feedback-text">${correctMsg.emoji} ${correctMsg.message}</div>
          </div>
          <div class="explanation">${result.explanation}</div>
        `;

        const answerOptionsContainer = document.querySelector('#optionsContainer');
        if (answerOptionsContainer) {
          Animations.celebrateCorrect(answerOptionsContainer.parentElement);
        }

        // Check for streaks and mastery
        const question = Quiz.getCurrentQuestion();
        const record = Storage.getQuestionRecord(question.id);
        const stats = Storage.getStats();

        // Show mastery message if question was just mastered
        if (record.mastered) {
          const masteryMsg = Messages.getMasteryMessage();
          const masteryDiv = document.createElement('div');
          masteryDiv.className = 'mastery-message';
          masteryDiv.textContent = `${masteryMsg.emoji} ${masteryMsg.message}`;
          feedbackEl.appendChild(masteryDiv);
          Animations.celebrateMastery(feedbackEl);
        }

        // Check for streak milestones
        const streakMsg = Messages.getStreakMessage(stats.currentStreak);
        if (streakMsg) {
          const streakDiv = document.createElement('div');
          streakDiv.className = 'streak-message';
          streakDiv.textContent = `${streakMsg.emoji} ${streakMsg.message}`;
          feedbackEl.appendChild(streakDiv);
        }
      } else {
        // Get supportive message for incorrect answer
        const incorrectMsg = Messages.getIncorrectMessage();

        feedbackEl.className = 'feedback-container incorrect';
        feedbackEl.innerHTML = `
          <div class="feedback-message">
            <div class="x-mark">✗</div>
            <div class="feedback-text">${incorrectMsg.emoji} ${incorrectMsg.message}</div>
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

      // Check for new achievements
      if (Achievements) {
        const newAchievements = Achievements.checkForNewAchievements();
        if (results.percentage === 100) {
          Achievements.checkPerfectTest(results);
        }

        // Display new achievement notification
        if (newAchievements.length > 0) {
          this.showNewAchievementsNotification(newAchievements);
        }
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

          // Check for category mastery achievement
          if (Achievements && percent === 100) {
            Achievements.checkCategoryMastery(category, stats);
          }
        });
      }
    },

    /**
     * Show notification for new achievements
     */
    showNewAchievementsNotification(achievements) {
      // Create a notification overlay
      const notificationEl = document.createElement('div');
      notificationEl.className = 'achievement-notification';
      notificationEl.innerHTML = `
        <div class="achievement-notification-content">
          <h3>🎉 New Achievement Unlocked!</h3>
          ${achievements.map(a => `
            <div class="achievement-unlocked">
              <div class="achievement-icon-large">${a.icon}</div>
              <div class="achievement-details">
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-description">${a.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      document.body.appendChild(notificationEl);

      // Remove after 3 seconds
      setTimeout(() => {
        notificationEl.classList.add('fade-out');
        setTimeout(() => notificationEl.remove(), 500);
      }, 3000);
    },

    /**
     * Get encouraging message based on performance
     */
    getResultMessage(percentage) {
      const resultMsg = Messages.getResultMessage(percentage);
      return `${resultMsg.emoji} ${resultMsg.message}`;
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
     * Show detailed statistics screen
     */
    showDetailedStats() {
      showScreen('stats');
      this.updateDetailedStatsDisplay();
    },

    /**
     * Update detailed statistics display
     */
    updateDetailedStatsDisplay() {
      const stats = Storage.getStats();
      const user = Storage.getUser();
      const total = QuestionManager.getTotalCount();

      // Overall stats
      const overallStatsEl = document.querySelector('#overallStats');
      if (overallStatsEl) {
        const accuracy = stats.totalAttempts > 0
          ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
          : 0;
        const masteredCount = Storage.getMasteredQuestions().length;

        overallStatsEl.innerHTML = `
          <div class="stat-row">
            <span>Total Questions Attempted:</span>
            <span><strong>${stats.totalAttempts}</strong></span>
          </div>
          <div class="stat-row">
            <span>Correct Answers:</span>
            <span><strong>${stats.totalCorrect}</strong></span>
          </div>
          <div class="stat-row">
            <span>Incorrect Answers:</span>
            <span><strong>${stats.totalIncorrect}</strong></span>
          </div>
          <div class="stat-row">
            <span>Overall Accuracy:</span>
            <span><strong>${accuracy}%</strong></span>
          </div>
          <div class="stat-row">
            <span>Tests Completed:</span>
            <span><strong>${stats.testsTaken}</strong></span>
          </div>
          <div class="stat-row">
            <span>Questions Mastered:</span>
            <span><strong>${masteredCount}/${total}</strong></span>
          </div>
        `;
      }

      // Detailed category stats
      const categories = QuestionManager.getCategories();
      const categoryStatsEl = document.querySelector('#detailedCategoryStats');
      if (categoryStatsEl) {
        categoryStatsEl.innerHTML = categories.map(category => {
          const catStats = stats.categoryBreakdown[category] || { attempts: 0, correct: 0 };
          const percent = catStats.attempts > 0
            ? Math.round((catStats.correct / catStats.attempts) * 100)
            : 0;

          return `
            <div class="detailed-category-item">
              <div class="category-header">
                <span>${category}</span>
                <span class="category-score">${percent}%</span>
              </div>
              <div class="category-bar">
                <div class="category-fill" style="width: ${percent}%"></div>
              </div>
              <div class="category-detail">
                <span>${catStats.correct}/${catStats.attempts} correct</span>
              </div>
            </div>
          `;
        }).join('');
      }

      // Streak stats
      const streakStatsEl = document.querySelector('#streakStats');
      if (streakStatsEl) {
        streakStatsEl.innerHTML = `
          <div class="stat-row">
            <span>Current Streak:</span>
            <span><strong>${stats.currentStreak} questions</strong></span>
          </div>
          <div class="stat-row">
            <span>Longest Streak:</span>
            <span><strong>${stats.longestStreak} questions</strong></span>
          </div>
          <div class="milestone-message">${this.getStreakMessage(stats.currentStreak)}</div>
        `;
      }

      // Journey stats
      const journeyStatsEl = document.querySelector('#journeyStats');
      if (journeyStatsEl && user) {
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        const lastVisitDate = new Date(user.lastVisit).toLocaleDateString();
        const daysActive = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) + 1;

        journeyStatsEl.innerHTML = `
          <div class="stat-row">
            <span>Learning Started:</span>
            <span><strong>${createdDate}</strong></span>
          </div>
          <div class="stat-row">
            <span>Last Practice Session:</span>
            <span><strong>${lastVisitDate}</strong></span>
          </div>
          <div class="stat-row">
            <span>Days Active:</span>
            <span><strong>${daysActive}</strong></span>
          </div>
          <div class="journey-message">Keep up the great work! You're on your way to mastering the Illinois Driver's Test! 🚗</div>
        `;
      }
    },

    /**
     * Get streak message
     */
    getStreakMessage(streak) {
      if (streak === 0) return '🏁 Start a new streak by answering a question correctly!';
      if (streak < 5) return `✨ You're building momentum! Keep it going!`;
      if (streak < 10) return `🔥 Fantastic streak! You're on fire!`;
      if (streak < 20) return `⭐ Amazing consistency! You're crushing it!`;
      return `👑 Incredible! You're a question-answering machine!`;
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

      const importBtn = document.querySelector('#importBtn');
      if (importBtn) {
        importBtn.onclick = () => this.importData();
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
     * Import data from JSON file
     */
    importData() {
      const fileInput = document.querySelector('#importFileInput');
      if (!fileInput) return;

      fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result);

            // Validate the imported data has required fields
            if (!importedData.user || !importedData.questionHistory || !importedData.stats) {
              alert('Invalid backup file. Missing required data.');
              return;
            }

            if (confirm('This will overwrite your current progress. Are you sure?')) {
              const success = Storage.importData(importedData);
              if (success) {
                alert('Progress imported successfully!');
                location.reload();
              } else {
                alert('Failed to import progress. Please try again.');
              }
            }
          } catch (error) {
            alert('Failed to read file. Please ensure it is a valid JSON backup.');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      };
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

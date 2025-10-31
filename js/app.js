/**
 * Main Application Controller
 * Orchestrates the entire application
 */

const App = (() => {
  /**
   * Initialize the application
   */
  const init = async () => {
    try {
      UI.showLoading();

      // Load questions
      const loaded = await QuestionManager.loadQuestions();
      if (!loaded) {
        UI.showError('Failed to load questions. Please refresh the page.');
        UI.hideLoading();
        return;
      }

      // Check for existing user
      const user = Storage.getUser();

      if (!user || !user.name) {
        // New user - show welcome screen
        UI.showWelcomeScreen();
        setupWelcomeScreenListeners();
      } else {
        // Returning user - show dashboard
        UI.showDashboard();
        setupDashboardListeners();
      }

      UI.hideLoading();
      setupGlobalListeners();
    } catch (e) {
      console.error('Error initializing app:', e);
      UI.showError('An error occurred while initializing the app.');
      UI.hideLoading();
    }
  };

  /**
   * Setup welcome screen event listeners
   */
  const setupWelcomeScreenListeners = () => {
    const nameInput = document.querySelector('#nameInput');
    const startBtn = document.querySelector('#startBtn');

    if (startBtn) {
      startBtn.onclick = () => {
        const name = nameInput?.value.trim();

        if (!name) {
          alert('Please enter your name');
          return;
        }

        Storage.setUser({ name });
        UI.showDashboard();
        setupDashboardListeners();
      };
    }

    // Allow Enter key to submit
    if (nameInput) {
      nameInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          startBtn?.click();
        }
      };
    }
  };

  /**
   * Setup dashboard event listeners
   */
  const setupDashboardListeners = () => {
    const practiceBtn = document.querySelector('#practiceBtn');
    const reviewBtn = document.querySelector('#reviewBtn');
    const statsBtn = document.querySelector('#statsBtn');
    const settingsBtn = document.querySelector('#settingsBtn');

    if (practiceBtn) {
      practiceBtn.onclick = () => {
        Quiz.initializePracticeTest();
        UI.showPracticeTest();
        setupPracticeTestListeners();
      };
    }

    if (reviewBtn) {
      reviewBtn.onclick = () => {
        const session = Quiz.initializeReviewMode();
        if (session) {
          UI.showReviewMode();
          setupPracticeTestListeners();
        } else {
          alert('No questions to review.');
        }
      };
    }

    if (statsBtn) {
      statsBtn.onclick = () => {
        UI.showDetailedStats();
        setupStatsListeners();
      };
    }

    if (settingsBtn) {
      settingsBtn.onclick = () => {
        UI.showSettings();
        setupSettingsListeners();
      };
    }

    // Reinitialize theme toggle listeners
    if (Theme && Theme.init) {
      Theme.init();
    }
  };

  /**
   * Setup practice test event listeners
   */
  const setupPracticeTestListeners = () => {
    const nextBtn = document.querySelector('#nextBtn');
    const exitBtn = document.querySelector('#exitBtn');

    if (nextBtn) {
      nextBtn.onclick = () => {
        UI.nextQuestion();
      };
    }

    if (exitBtn) {
      exitBtn.onclick = () => {
        if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
          Quiz.endSession();
          UI.showDashboard();
          setupDashboardListeners();
        }
      };
    }
  };

  /**
   * Setup test complete screen listeners
   */
  const setupTestCompleteListeners = () => {
    const anotherTestBtn = document.querySelector('#anotherTestBtn');
    const reviewMissedBtn = document.querySelector('#reviewMissedBtn');
    const dashboardBtn = document.querySelector('#dashboardBtn');

    if (anotherTestBtn) {
      anotherTestBtn.onclick = () => {
        Quiz.endSession();
        Quiz.initializePracticeTest();
        UI.showPracticeTest();
        setupPracticeTestListeners();
      };
    }

    if (reviewMissedBtn) {
      reviewMissedBtn.onclick = () => {
        Quiz.endSession();
        const session = Quiz.initializeReviewMode();
        if (session) {
          UI.showReviewMode();
          setupPracticeTestListeners();
        }
      };
    }

    if (dashboardBtn) {
      dashboardBtn.onclick = () => {
        Quiz.endSession();
        UI.showDashboard();
        setupDashboardListeners();
      };
    }
  };

  /**
   * Setup stats screen listeners
   */
  const setupStatsListeners = () => {
    const backBtn = document.querySelector('#backFromStatsBtn');

    if (backBtn) {
      backBtn.onclick = () => {
        UI.showDashboard();
        setupDashboardListeners();
      };
    }

    // Reinitialize theme toggle listeners
    if (Theme && Theme.init) {
      Theme.init();
    }
  };

  /**
   * Setup settings screen listeners
   */
  const setupSettingsListeners = () => {
    const backBtn = document.querySelector('#backBtn');
    const saveNameBtn = document.querySelector('#saveNameBtn');
    const nameInput = document.querySelector('#settingsNameInput');

    if (saveNameBtn) {
      saveNameBtn.onclick = () => {
        const newName = nameInput?.value.trim();
        if (newName) {
          Storage.setUser({ name: newName });
          alert('Name updated successfully!');
        }
      };
    }

    if (backBtn) {
      backBtn.onclick = () => {
        UI.showDashboard();
        setupDashboardListeners();
      };
    }

    // Reinitialize theme toggle listeners
    if (Theme && Theme.init) {
      Theme.init();
    }
  };

  /**
   * Setup global listeners
   */
  const setupGlobalListeners = () => {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Arrow keys for navigation (optional feature)
      if (e.key === 'Enter') {
        const focusedBtn = document.activeElement;
        if (focusedBtn && focusedBtn.onclick) {
          focusedBtn.click();
        }
      }
    });
  };

  /**
   * Handle screen updates when test completes
   */
  const onTestComplete = () => {
    setupTestCompleteListeners();
  };

  // Expose public methods
  return {
    init,
    onTestComplete
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Handle test completion
const originalShowTestComplete = UI.showTestComplete.bind(UI);
UI.showTestComplete = function() {
  originalShowTestComplete();
  App.onTestComplete();
};

/**
 * Theme Manager
 * Handles dark mode switching with device preference detection and local storage persistence
 */

const Theme = (() => {
  const THEME_KEY = 'theme-preference';
  const DARK_MODE_CLASS = 'dark-mode';
  let initialized = false;

  /**
   * Initialize theme system
   * Detects system preference and applies saved user preference
   */
  const init = () => {
    // Only run full initialization once
    if (!initialized) {
      applyTheme();

      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          // Only apply if user hasn't manually set a preference
          if (!localStorage.getItem(THEME_KEY)) {
            if (e.matches) {
              enableDarkMode();
            } else {
              disableDarkMode();
            }
          }
        });
      }

      initialized = true;
    }

    // Always update listeners when screens change
    setupThemeToggleListeners();
  };

  /**
   * Apply saved theme or system preference
   */
  const applyTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
      // User has a saved preference
      if (savedTheme === 'dark') {
        applyDarkMode();
      } else {
        applyLightMode();
      }
    } else {
      // No saved preference, use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDarkMode();
      } else {
        applyLightMode();
      }
    }
  };

  /**
   * Apply dark mode without saving preference (internal use)
   */
  const applyDarkMode = () => {
    document.documentElement.classList.add(DARK_MODE_CLASS);
    updateThemeToggleButtons('☀️'); // Show sun icon when dark mode is on
  };

  /**
   * Apply light mode without saving preference (internal use)
   */
  const applyLightMode = () => {
    document.documentElement.classList.remove(DARK_MODE_CLASS);
    updateThemeToggleButtons('🌙'); // Show moon icon when light mode is on
  };

  /**
   * Enable dark mode and save preference
   */
  const enableDarkMode = () => {
    applyDarkMode();
    localStorage.setItem(THEME_KEY, 'dark');
  };

  /**
   * Disable dark mode (light mode) and save preference
   */
  const disableDarkMode = () => {
    applyLightMode();
    localStorage.setItem(THEME_KEY, 'light');
  };

  /**
   * Toggle theme
   */
  const toggleTheme = () => {
    if (document.documentElement.classList.contains(DARK_MODE_CLASS)) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };

  /**
   * Update all theme toggle buttons with appropriate icon
   */
  const updateThemeToggleButtons = (icon) => {
    const buttons = document.querySelectorAll('[id*="themeToggle"]');
    buttons.forEach(btn => {
      if (btn) {
        btn.textContent = icon;
      }
    });
  };

  /**
   * Setup theme toggle button listeners
   */
  const setupThemeToggleListeners = () => {
    const themeToggleBtns = document.querySelectorAll('[id*="themeToggle"]');
    themeToggleBtns.forEach(btn => {
      if (btn) {
        // Use addEventListener to ensure proper mobile Safari support
        btn.removeEventListener('click', toggleTheme);
        btn.addEventListener('click', toggleTheme, false);
      }
    });
  };

  /**
   * Check if dark mode is enabled
   */
  const isDarkMode = () => {
    return document.documentElement.classList.contains(DARK_MODE_CLASS);
  };

  // Expose public methods
  return {
    init,
    toggleTheme,
    isDarkMode,
    enableDarkMode,
    disableDarkMode,
    applyTheme
  };
})();

// Initialize theme system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});

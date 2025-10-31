/**
 * Theme Manager
 * Handles dark mode switching with device preference detection and local storage persistence
 */

const Theme = (() => {
  const THEME_KEY = 'theme-preference';
  const DARK_MODE_CLASS = 'dark-mode';

  /**
   * Initialize theme system
   * Detects system preference and applies saved user preference
   */
  const init = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
      // User has a saved preference
      if (savedTheme === 'dark') {
        enableDarkMode();
      } else {
        disableDarkMode();
      }
    } else {
      // No saved preference, use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enableDarkMode();
      } else {
        disableDarkMode();
      }
    }

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

    setupThemeToggleListeners();
  };

  /**
   * Enable dark mode
   */
  const enableDarkMode = () => {
    document.documentElement.classList.add(DARK_MODE_CLASS);
    updateThemeToggleButtons('☀️'); // Show sun icon when dark mode is on
    localStorage.setItem(THEME_KEY, 'dark');
  };

  /**
   * Disable dark mode (light mode)
   */
  const disableDarkMode = () => {
    document.documentElement.classList.remove(DARK_MODE_CLASS);
    updateThemeToggleButtons('🌙'); // Show moon icon when light mode is on
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
      btn.textContent = icon;
    });
  };

  /**
   * Setup theme toggle button listeners
   */
  const setupThemeToggleListeners = () => {
    const themeToggleBtns = document.querySelectorAll('[id*="themeToggle"]');
    themeToggleBtns.forEach(btn => {
      if (btn && !btn.dataset.themeListenerSet) {
        btn.onclick = toggleTheme;
        btn.dataset.themeListenerSet = 'true';
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
    disableDarkMode
  };
})();

// Initialize theme system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});

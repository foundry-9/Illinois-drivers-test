/**
 * Animation Controller Module
 * Handles animation effects and triggers
 */

const Animations = (() => {
  /**
   * Create confetti effect
   */
  const createConfetti = (element) => {
    const colors = ['#4CAF50', '#FFC107', '#FF9800', '#2196F3', '#9C27B0'];
    const confettiPieces = 50;

    for (let i = 0; i < confettiPieces; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animation = `fall ${2 + Math.random() * 1}s linear forwards`;
      element.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  };

  /**
   * Create stars animation
   */
  const createStars = (element) => {
    const starCount = 15;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.textContent = '★';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animation = `twinkle ${0.6 + Math.random() * 0.4}s ease-in-out forwards`;
      element.appendChild(star);

      setTimeout(() => star.remove(), 1000);
    }
  };

  /**
   * Pulse animation for elements
   */
  const pulse = (element, duration = 300) => {
    element.classList.add('pulse');
    setTimeout(() => {
      element.classList.remove('pulse');
    }, duration);
  };

  /**
   * Shake animation for incorrect answers
   */
  const shake = (element, duration = 500) => {
    element.classList.add('shake');
    setTimeout(() => {
      element.classList.remove('shake');
    }, duration);
  };

  /**
   * Flip animation for answer reveal
   */
  const flip = (element, duration = 400) => {
    element.classList.add('flip');
    setTimeout(() => {
      element.classList.remove('flip');
    }, duration);
  };

  /**
   * Slide in from bottom
   */
  const slideInUp = (element, duration = 500) => {
    element.classList.add('slide-in-up');
    setTimeout(() => {
      element.classList.remove('slide-in-up');
    }, duration);
  };

  /**
   * Fade in
   */
  const fadeIn = (element, duration = 300) => {
    element.style.opacity = '0';
    element.classList.add('fade-in');
    setTimeout(() => {
      element.classList.remove('fade-in');
      element.style.opacity = '1';
    }, duration);
  };

  /**
   * Correct answer celebration
   */
  const celebrateCorrect = (element) => {
    pulse(element);
    createConfetti(element);
    element.classList.add('bounce');
    setTimeout(() => {
      element.classList.remove('bounce');
    }, 600);
  };

  /**
   * Incorrect answer reaction
   */
  const reactionIncorrect = (element) => {
    shake(element);
    element.classList.add('error-glow');
    setTimeout(() => {
      element.classList.remove('error-glow');
    }, 500);
  };

  /**
   * Mastery celebration (enhanced)
   */
  const celebrateMastery = (element) => {
    element.classList.add('mastery-burst');
    createConfetti(element);
    createStars(element);

    setTimeout(() => {
      element.classList.remove('mastery-burst');
    }, 1500);
  };

  /**
   * Streak celebration
   */
  const celebrateStreak = (streakCount) => {
    const messages = {
      5: "You're on a roll! 🔥",
      10: "10 in a row! 🌟",
      15: "15 questions mastered! 💪",
      20: "20 in a row! You're unstoppable! 🚀"
    };

    const message = messages[streakCount];
    if (message) {
      return message;
    }
    return null;
  };

  /**
   * Bounce progress bar to new value
   */
  const bounceProgressBar = (progressElement, newValue) => {
    progressElement.style.transition = 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    progressElement.style.width = newValue + '%';
  };

  /**
   * Rotate an element (for loading spinners)
   */
  const startSpinner = (element) => {
    element.classList.add('spinning');
  };

  const stopSpinner = (element) => {
    element.classList.remove('spinning');
  };

  return {
    createConfetti,
    createStars,
    pulse,
    shake,
    flip,
    slideInUp,
    fadeIn,
    celebrateCorrect,
    reactionIncorrect,
    celebrateMastery,
    celebrateStreak,
    bounceProgressBar,
    startSpinner,
    stopSpinner
  };
})();

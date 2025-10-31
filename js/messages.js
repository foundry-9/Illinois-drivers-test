/**
 * Messages Module
 * Provides encouraging, context-aware messages throughout the app
 */

const Messages = (() => {
  // Correct answer messages - varied for repeated feedback
  const correctAnswerMessages = [
    { message: "Excellent!", emoji: "🌟" },
    { message: "You got it!", emoji: "✅" },
    { message: "Perfect!", emoji: "🎯" },
    { message: "Great job!", emoji: "💪" },
    { message: "Nailed it!", emoji: "🔥" },
    { message: "Outstanding!", emoji: "🚀" },
    { message: "Well done!", emoji: "👏" },
    { message: "You're crushing it!", emoji: "💯" },
    { message: "Absolutely right!", emoji: "⭐" }
  ];

  // Incorrect answer messages - supportive and encouraging
  const incorrectAnswerMessages = [
    { message: "Not quite, but you're learning!", emoji: "📚" },
    { message: "Close! Let's review this.", emoji: "🔍" },
    { message: "You'll get it next time!", emoji: "💡" },
    { message: "That's okay, keep practicing!", emoji: "🎓" },
    { message: "Great attempt! Let's see the answer.", emoji: "👀" },
    { message: "Learning moment! Check this out.", emoji: "📖" }
  ];

  // Streak milestone messages
  const streakMessages = {
    3: { message: "3 in a row! You're on fire!", emoji: "🔥" },
    5: { message: "5 in a row! Amazing progress!", emoji: "🚀" },
    10: { message: "10 in a row! You're unstoppable!", emoji: "⚡" },
    15: { message: "15 in a row! Absolutely incredible!", emoji: "💫" },
    20: { message: "20 in a row! You're a star!", emoji: "⭐" },
    25: { message: "25 consecutive correct! Phenomenal!", emoji: "🏆" }
  };

  // Mastery achievement messages
  const masteryMessages = [
    { message: "Question Mastered!", emoji: "🎉" },
    { message: "You've conquered this one!", emoji: "🏅" },
    { message: "This question is yours!", emoji: "👑" },
    { message: "Mastery unlocked!", emoji: "🔓" },
    { message: "Question complete!", emoji: "✨" }
  ];

  // Test result messages based on performance
  const resultMessages = {
    perfect: {
      message: "Perfect score! You're absolutely crushing it!",
      emoji: "🏆"
    },
    excellent: {
      message: "Excellent work! You really know this stuff!",
      emoji: "🌟"
    },
    great: {
      message: "Great job! Keep practicing and you'll master this!",
      emoji: "💪"
    },
    good: {
      message: "Good effort! You're making solid progress!",
      emoji: "📈"
    },
    okay: {
      message: "Nice try! Keep practicing and it'll click!",
      emoji: "🎓"
    },
    struggling: {
      message: "Keep practicing! Every attempt helps you learn!",
      emoji: "📚"
    }
  };

  // Greeting messages for dashboard
  const greetingMessages = [
    { message: "Welcome back, {name}!", emoji: "👋" },
    { message: "Ready to practice, {name}?", emoji: "🚗" },
    { message: "Great to see you, {name}!", emoji: "😊" },
    { message: "Let's ace this, {name}!", emoji: "🎯" },
    { message: "Time to master, {name}!", emoji: "💡" }
  ];

  // Motivational messages for empty states
  const motivationalMessages = [
    "You're doing great! Keep up the momentum!",
    "Every question brings you closer to mastery!",
    "You've got this! Stay focused and keep learning!",
    "Progress is progress! Celebrate the small wins!",
    "Your dedication is paying off! Keep going!",
    "You're building knowledge with every attempt!",
    "Remember: consistency leads to mastery!",
    "You're stronger than any test!"
  ];

  /**
   * Get a random correct answer message
   */
  const getCorrectMessage = () => {
    const msg = correctAnswerMessages[Math.floor(Math.random() * correctAnswerMessages.length)];
    return msg;
  };

  /**
   * Get a random incorrect answer message
   */
  const getIncorrectMessage = () => {
    const msg = incorrectAnswerMessages[Math.floor(Math.random() * incorrectAnswerMessages.length)];
    return msg;
  };

  /**
   * Get streak message if applicable
   */
  const getStreakMessage = (streakCount) => {
    // Check exact match first, then closest lower milestone
    if (streakMessages[streakCount]) {
      return streakMessages[streakCount];
    }

    // Find nearest lower milestone
    const milestones = Object.keys(streakMessages)
      .map(Number)
      .sort((a, b) => b - a);

    for (const milestone of milestones) {
      if (streakCount >= milestone) {
        return streakMessages[milestone];
      }
    }

    return null;
  };

  /**
   * Get mastery message
   */
  const getMasteryMessage = () => {
    const msg = masteryMessages[Math.floor(Math.random() * masteryMessages.length)];
    return msg;
  };

  /**
   * Get result message based on percentage
   */
  const getResultMessage = (percentage) => {
    if (percentage === 100) {
      return resultMessages.perfect;
    } else if (percentage >= 90) {
      return resultMessages.excellent;
    } else if (percentage >= 80) {
      return resultMessages.great;
    } else if (percentage >= 70) {
      return resultMessages.good;
    } else if (percentage >= 60) {
      return resultMessages.okay;
    } else {
      return resultMessages.struggling;
    }
  };

  /**
   * Get greeting message for a user
   */
  const getGreeting = (userName) => {
    const msg = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
    return {
      message: msg.message.replace('{name}', userName),
      emoji: msg.emoji
    };
  };

  /**
   * Get a random motivational message
   */
  const getMotivationalMessage = () => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  /**
   * Get a context-aware congratulation message
   */
  const getCongratulationMessage = (context) => {
    const messages = {
      firstQuestion: {
        message: "Great start! Keep this energy going!",
        emoji: "🚀"
      },
      halfwayThere: {
        message: "Halfway there! You're doing fantastic!",
        emoji: "💪"
      },
      almostDone: {
        message: "Almost done! Give it one more push!",
        emoji: "⚡"
      },
      allMastered: {
        message: "All questions mastered! You're ready!",
        emoji: "🏆"
      },
      newMastery: {
        message: "That's a new personal record!",
        emoji: "📈"
      }
    };

    return messages[context] || null;
  };

  return {
    getCorrectMessage,
    getIncorrectMessage,
    getStreakMessage,
    getMasteryMessage,
    getResultMessage,
    getGreeting,
    getMotivationalMessage,
    getCongratulationMessage
  };
})();

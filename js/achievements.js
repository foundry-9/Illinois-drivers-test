/**
 * Achievement System
 * Tracks and manages user achievements and badges
 */

const Achievements = (() => {
  // Achievement definitions
  const ACHIEVEMENTS = {
    first_correct: {
      id: 'first_correct',
      name: 'First Steps',
      description: 'Answer your first question correctly',
      icon: '👣',
      condition: (stats) => stats.totalCorrect >= 1
    },
    ten_correct: {
      id: 'ten_correct',
      name: '10 in a Row',
      description: 'Get 10 consecutive correct answers',
      icon: '🔟',
      condition: (stats) => stats.longestStreak >= 10
    },
    fifty_correct: {
      id: 'fifty_correct',
      name: 'Halfway There',
      description: 'Answer 50 questions correctly',
      icon: '5️⃣0️⃣',
      condition: (stats) => stats.totalCorrect >= 50
    },
    hundred_correct: {
      id: 'hundred_correct',
      name: 'Century Club',
      description: 'Answer 100 questions correctly',
      icon: '💯',
      condition: (stats) => stats.totalCorrect >= 100
    },
    perfect_test: {
      id: 'perfect_test',
      name: 'Perfect Score',
      description: 'Complete a practice test with 100% accuracy',
      icon: '🌟',
      condition: null // Set via session tracking
    },
    mastered_ten: {
      id: 'mastered_ten',
      name: 'Master Learner',
      description: 'Master 10 questions',
      icon: '🎓',
      condition: (stats) => stats.questionsMastered >= 10
    },
    mastered_twenty_five: {
      id: 'mastered_twenty_five',
      name: 'Expert',
      description: 'Master 25 questions',
      icon: '🏆',
      condition: (stats) => stats.questionsMastered >= 25
    },
    mastered_fifty: {
      id: 'mastered_fifty',
      name: 'Master of All',
      description: 'Master 50 questions',
      icon: '👑',
      condition: (stats) => stats.questionsMastered >= 50
    },
    category_master: {
      id: 'category_master',
      name: 'Category Expert',
      description: 'Get 100% accuracy in a category',
      icon: '📚',
      condition: null // Set via category tracking
    },
    long_streak: {
      id: 'long_streak',
      name: 'On Fire',
      description: 'Get a 20-question streak',
      icon: '🔥',
      condition: (stats) => stats.longestStreak >= 20
    },
    consistent: {
      id: 'consistent',
      name: 'Consistent Learner',
      description: 'Maintain 90% or higher accuracy across all attempts',
      icon: '📈',
      condition: (stats) => {
        return stats.totalAttempts >= 20 &&
               (stats.totalCorrect / stats.totalAttempts) >= 0.9;
      }
    }
  };

  /**
   * Get all achievements
   */
  const getAllAchievements = () => ACHIEVEMENTS;

  /**
   * Get earned achievements
   */
  const getEarnedAchievements = () => {
    const earnedIds = Storage.getAchievements() || [];
    return earnedIds
      .map(id => ACHIEVEMENTS[id])
      .filter(achievement => achievement !== undefined);
  };

  /**
   * Check if achievement is earned
   */
  const isEarned = (achievementId) => {
    const earned = Storage.getAchievements() || [];
    return earned.includes(achievementId);
  };

  /**
   * Check for newly earned achievements
   */
  const checkForNewAchievements = () => {
    const stats = Storage.getStats();
    const earned = Storage.getAchievements() || [];
    const newAchievements = [];

    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
      if (!earned.includes(id) && achievement.condition && achievement.condition(stats)) {
        earned.push(id);
        newAchievements.push(achievement);
      }
    });

    if (newAchievements.length > 0) {
      Storage.setAchievements(earned);
    }

    return newAchievements;
  };

  /**
   * Award specific achievement (for perfect tests, category mastery)
   */
  const awardAchievement = (achievementId) => {
    const earned = Storage.getAchievements() || [];
    if (!earned.includes(achievementId)) {
      earned.push(achievementId);
      Storage.setAchievements(earned);
      return ACHIEVEMENTS[achievementId];
    }
    return null;
  };

  /**
   * Check and award perfect test achievement
   */
  const checkPerfectTest = (sessionResults) => {
    if (sessionResults.correct === sessionResults.total) {
      return awardAchievement('perfect_test');
    }
    return null;
  };

  /**
   * Check and award category master achievement
   */
  const checkCategoryMastery = (category, categoryStats) => {
    if (categoryStats.attempts > 0 && categoryStats.correct === categoryStats.attempts) {
      // Store which categories have 100% accuracy
      const categoryMasters = Storage.getCategoryMasters() || [];
      if (!categoryMasters.includes(category)) {
        categoryMasters.push(category);
        Storage.setCategoryMasters(categoryMasters);
        return awardAchievement('category_master');
      }
    }
    return null;
  };

  /**
   * Get achievement progress (percentage to next achievement)
   */
  const getProgress = () => {
    const stats = Storage.getStats();
    const earned = Storage.getAchievements() || [];

    return {
      earned: earned.length,
      total: Object.keys(ACHIEVEMENTS).length,
      percentage: Math.round((earned.length / Object.keys(ACHIEVEMENTS).length) * 100),
      nextMilestone: getNextMilestone(stats, earned)
    };
  };

  /**
   * Get next achievement to unlock
   */
  const getNextMilestone = (stats, earned) => {
    const possibleNext = Object.entries(ACHIEVEMENTS)
      .filter(([id]) => !earned.includes(id))
      .find(([, achievement]) => achievement.condition && achievement.condition(stats));

    return possibleNext ? possibleNext[1] : null;
  };

  /**
   * Get achievement display
   */
  const getAchievementDisplay = (achievement) => {
    return `${achievement.icon} ${achievement.name}`;
  };

  // Expose public methods
  return {
    getAllAchievements,
    getEarnedAchievements,
    isEarned,
    checkForNewAchievements,
    awardAchievement,
    checkPerfectTest,
    checkCategoryMastery,
    getProgress,
    getNextMilestone,
    getAchievementDisplay
  };
})();

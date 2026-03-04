// stats.js - Statistics tracking and persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'vocabBubblesStats';
const LEARNED_WORDS_KEY = 'vocabBubblesLearnedWords';
const DAILY_ACTIVITY_KEY = 'vocabBubblesDailyActivity';

// Initialize default stats
const defaultStats = {
  puzzlesCompleted: 0,
  wordsLearned: 0,
  totalWordsFound: 0,
  accuracy: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayDate: null,
  firstPlayDate: null,
  totalPlayTime: 0, // in minutes
  averageWordsPerPuzzle: 0,
  hintsUsed: 0,
  perfectPuzzles: 0, // puzzles completed without hints
};

// Get current stats
export const getStats = async () => {
  try {
    const statsJson = await AsyncStorage.getItem(STATS_KEY);
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    return defaultStats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return defaultStats;
  }
};

// Update stats
export const updateStats = async (updates) => {
  try {
    const currentStats = await getStats();
    const newStats = { ...currentStats, ...updates };
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.error('Error updating stats:', error);
    return currentStats;
  }
};

// Track puzzle completion
export const recordPuzzleCompletion = async (wordsFound, totalWords, hintsUsed, playTimeMinutes) => {
  try {
    const currentStats = await getStats();
    const today = new Date().toDateString();
    
    // Calculate accuracy for this puzzle
    const puzzleAccuracy = (wordsFound / totalWords) * 100;
    
    // Calculate new overall accuracy
    const newTotalWordsFound = currentStats.totalWordsFound + wordsFound;
    const newPuzzlesCompleted = currentStats.puzzlesCompleted + 1;
    
    // Update streak
    let newStreak = currentStats.currentStreak;
    if (currentStats.lastPlayDate) {
      const lastPlay = new Date(currentStats.lastPlayDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastPlay.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, keep current streak
    } else {
      // First play
      newStreak = 1;
    }
    
    const newStats = {
      ...currentStats,
      puzzlesCompleted: newPuzzlesCompleted,
      totalWordsFound: newTotalWordsFound,
      accuracy: (newTotalWordsFound / (newPuzzlesCompleted * totalWords)) * 100,
      currentStreak: newStreak,
      bestStreak: Math.max(currentStats.bestStreak, newStreak),
      lastPlayDate: today,
      firstPlayDate: currentStats.firstPlayDate || today,
      totalPlayTime: currentStats.totalPlayTime + playTimeMinutes,
      averageWordsPerPuzzle: newTotalWordsFound / newPuzzlesCompleted,
      hintsUsed: currentStats.hintsUsed + hintsUsed,
      perfectPuzzles: currentStats.perfectPuzzles + (hintsUsed === 0 ? 1 : 0),
    };
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    
    // Update daily activity
    await recordDailyActivity(today, wordsFound);
    
    return newStats;
  } catch (error) {
    console.error('Error recording puzzle completion:', error);
    return await getStats();
  }
};

// Track learned words
export const addLearnedWord = async (word) => {
  try {
    const learnedWordsJson = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
    const learnedWords = learnedWordsJson ? JSON.parse(learnedWordsJson) : {};
    
    // Add word with timestamp if not already learned
    if (!learnedWords[word]) {
      learnedWords[word] = {
        learnedDate: new Date().toISOString(),
        reviewCount: 0,
        lastReviewed: null,
      };
      
      await AsyncStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(learnedWords));
      
      // Update words learned count
      const currentStats = await getStats();
      await updateStats({ wordsLearned: currentStats.wordsLearned + 1 });
      
      return true; // New word learned
    }
    
    return false; // Word already learned
  } catch (error) {
    console.error('Error adding learned word:', error);
    return false;
  }
};

// Get learned words
export const getLearnedWords = async () => {
  try {
    const learnedWordsJson = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
    return learnedWordsJson ? JSON.parse(learnedWordsJson) : {};
  } catch (error) {
    console.error('Error getting learned words:', error);
    return {};
  }
};

// Record daily activity
const recordDailyActivity = async (date, wordsFound) => {
  try {
    const activityJson = await AsyncStorage.getItem(DAILY_ACTIVITY_KEY);
    const activity = activityJson ? JSON.parse(activityJson) : {};
    
    if (!activity[date]) {
      activity[date] = { puzzles: 0, words: 0 };
    }
    
    activity[date].puzzles += 1;
    activity[date].words += wordsFound;
    
    await AsyncStorage.setItem(DAILY_ACTIVITY_KEY, JSON.stringify(activity));
  } catch (error) {
    console.error('Error recording daily activity:', error);
  }
};

// Get daily activity for last N days
export const getDailyActivity = async (days = 7) => {
  try {
    const activityJson = await AsyncStorage.getItem(DAILY_ACTIVITY_KEY);
    const activity = activityJson ? JSON.parse(activityJson) : {};
    
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      result.push({
        date: dateString,
        puzzles: activity[dateString]?.puzzles || 0,
        words: activity[dateString]?.words || 0,
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error getting daily activity:', error);
    return [];
  }
};

// Check if played today
export const hasPlayedToday = async () => {
  try {
    const stats = await getStats();
    if (!stats.lastPlayDate) return false;
    
    const today = new Date().toDateString();
    return stats.lastPlayDate === today;
  } catch (error) {
    console.error('Error checking if played today:', error);
    return false;
  }
};

// Get streak info with emoji
export const getStreakInfo = async () => {
  try {
    const stats = await getStats();
    const playedToday = await hasPlayedToday();
    
    let streakEmoji = '🔥';
    let streakText = `${stats.currentStreak} day streak`;
    
    if (stats.currentStreak === 0) {
      streakEmoji = '💤';
      streakText = 'Start your streak!';
    } else if (stats.currentStreak >= 7) {
      streakEmoji = '🚀';
    } else if (stats.currentStreak >= 30) {
      streakEmoji = '⚡';
    }
    
    return {
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      playedToday,
      emoji: streakEmoji,
      text: streakText,
    };
  } catch (error) {
    console.error('Error getting streak info:', error);
    return {
      currentStreak: 0,
      bestStreak: 0,
      playedToday: false,
      emoji: '💤',
      text: 'Start your streak!',
    };
  }
};

// Reset all stats (for testing or user request)
export const resetStats = async () => {
  try {
    await AsyncStorage.removeItem(STATS_KEY);
    await AsyncStorage.removeItem(LEARNED_WORDS_KEY);
    await AsyncStorage.removeItem(DAILY_ACTIVITY_KEY);
    return defaultStats;
  } catch (error) {
    console.error('Error resetting stats:', error);
    return defaultStats;
  }
};
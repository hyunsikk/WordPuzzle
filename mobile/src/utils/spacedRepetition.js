// spacedRepetition.js - Spaced Repetition System for vocabulary learning
// Implements a simplified SM-2 algorithm for word review scheduling

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWordData } from '../data/examples';

const SPACED_REP_KEY = 'vocabBubblesSpacedRep';

// Default spaced repetition data for new words
const getDefaultWordData = (word, definition) => ({
  wordId: word.toLowerCase(),
  word: word.toUpperCase(),
  definition,
  lastReviewed: null,
  nextReview: null,
  interval: 1, // days
  easeFactor: 2.5, // SM-2 ease factor
  correctCount: 0,
  incorrectCount: 0,
  totalReviews: 0,
  addedDate: new Date().toISOString(),
  masteryLevel: 'new' // new, learning, mastered
});

// Get all spaced repetition data
export const getSpacedRepetitionData = async () => {
  try {
    const dataJson = await AsyncStorage.getItem(SPACED_REP_KEY);
    return dataJson ? JSON.parse(dataJson) : {};
  } catch (error) {
    console.error('Error getting spaced repetition data:', error);
    return {};
  }
};

// Save spaced repetition data
const saveSpacedRepetitionData = async (data) => {
  try {
    await AsyncStorage.setItem(SPACED_REP_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving spaced repetition data:', error);
    return false;
  }
};

// Add word to spaced repetition system
export const addWordToSpacedRep = async (word, definition) => {
  try {
    const data = await getSpacedRepetitionData();
    const wordKey = word.toLowerCase();
    
    // Don't add if already exists
    if (data[wordKey]) {
      return data[wordKey];
    }
    
    // Create new word entry
    const wordData = getDefaultWordData(word, definition);
    data[wordKey] = wordData;
    
    await saveSpacedRepetitionData(data);
    return wordData;
  } catch (error) {
    console.error('Error adding word to spaced repetition:', error);
    return null;
  }
};

// Get words due for review
export const getWordsForReview = async (limit = 10) => {
  try {
    const data = await getSpacedRepetitionData();
    const today = new Date();
    const todayStr = today.toDateString();
    
    const wordsArray = Object.values(data);
    
    // Filter words that are due for review
    const dueWords = wordsArray.filter(word => {
      if (!word.nextReview) {
        // Never reviewed - due for first review
        return true;
      }
      
      const nextReviewDate = new Date(word.nextReview);
      return nextReviewDate <= today;
    });
    
    // Sort by priority: overdue first, then by interval (shorter intervals first)
    dueWords.sort((a, b) => {
      const aOverdue = a.nextReview ? new Date(a.nextReview) < today : false;
      const bOverdue = b.nextReview ? new Date(b.nextReview) < today : false;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return a.interval - b.interval;
    });
    
    return dueWords.slice(0, limit);
  } catch (error) {
    console.error('Error getting words for review:', error);
    return [];
  }
};

// Calculate next review date based on SM-2 algorithm
const calculateNextReview = (interval, easeFactor, correct) => {
  if (correct) {
    // Correct answer - increase interval
    if (interval === 1) {
      return { newInterval: 2, newEaseFactor: easeFactor };
    } else if (interval === 2) {
      return { newInterval: 4, newEaseFactor: easeFactor };
    } else {
      const newInterval = Math.round(interval * easeFactor);
      return { newInterval, newEaseFactor: easeFactor };
    }
  } else {
    // Incorrect answer - reset to 1 day, reduce ease factor
    const newEaseFactor = Math.max(1.3, easeFactor - 0.2);
    return { newInterval: 1, newEaseFactor };
  }
};

// Record quiz result for a word
export const recordQuizResult = async (word, correct) => {
  try {
    const data = await getSpacedRepetitionData();
    const wordKey = word.toLowerCase();
    
    if (!data[wordKey]) {
      console.error('Word not found in spaced repetition data:', word);
      return false;
    }
    
    const wordData = data[wordKey];
    const today = new Date();
    
    // Calculate next review using SM-2 algorithm
    const { newInterval, newEaseFactor } = calculateNextReview(
      wordData.interval,
      wordData.easeFactor,
      correct
    );
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    
    // Update word data
    const updatedWordData = {
      ...wordData,
      lastReviewed: today.toISOString(),
      nextReview: nextReview.toISOString(),
      interval: newInterval,
      easeFactor: newEaseFactor,
      correctCount: wordData.correctCount + (correct ? 1 : 0),
      incorrectCount: wordData.incorrectCount + (correct ? 0 : 1),
      totalReviews: wordData.totalReviews + 1,
      masteryLevel: calculateMasteryLevel(
        wordData.correctCount + (correct ? 1 : 0),
        wordData.incorrectCount + (correct ? 0 : 1),
        newInterval
      )
    };
    
    data[wordKey] = updatedWordData;
    await saveSpacedRepetitionData(data);
    
    return updatedWordData;
  } catch (error) {
    console.error('Error recording quiz result:', error);
    return false;
  }
};

// Calculate mastery level based on performance
const calculateMasteryLevel = (correctCount, incorrectCount, interval) => {
  const totalReviews = correctCount + incorrectCount;
  const accuracy = totalReviews > 0 ? correctCount / totalReviews : 0;
  
  if (correctCount >= 3 && accuracy >= 0.8 && interval >= 8) {
    return 'mastered';
  } else if (totalReviews > 0) {
    return 'learning';
  } else {
    return 'new';
  }
};

// Get mastery statistics
export const getMasteryStats = async () => {
  try {
    const data = await getSpacedRepetitionData();
    const wordsArray = Object.values(data);
    
    const stats = {
      new: 0,
      learning: 0,
      mastered: 0,
      total: wordsArray.length
    };
    
    wordsArray.forEach(word => {
      if (stats.hasOwnProperty(word.masteryLevel)) {
        stats[word.masteryLevel]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting mastery stats:', error);
    return { new: 0, learning: 0, mastered: 0, total: 0 };
  }
};

// Get words by mastery level
export const getWordsByMastery = async (masteryLevel) => {
  try {
    const data = await getSpacedRepetitionData();
    const wordsArray = Object.values(data);
    
    return wordsArray
      .filter(word => word.masteryLevel === masteryLevel)
      .sort((a, b) => new Date(b.lastReviewed || b.addedDate) - new Date(a.lastReviewed || a.addedDate));
  } catch (error) {
    console.error('Error getting words by mastery:', error);
    return [];
  }
};

// Calculate vocabulary strength score
export const getVocabularyScore = async () => {
  try {
    const stats = await getMasteryStats();
    
    // Scoring: mastered words worth 10 points, learning words worth 3 points
    const score = (stats.mastered * 10) + (stats.learning * 3);
    
    // Rough SAT score correlation (very approximate)
    // Based on typical vocabulary requirements for different SAT verbal score ranges
    let satEquivalent = 'Beginning';
    if (score >= 1000) {
      satEquivalent = '700+ SAT Verbal';
    } else if (score >= 800) {
      satEquivalent = '650+ SAT Verbal';
    } else if (score >= 600) {
      satEquivalent = '600+ SAT Verbal';
    } else if (score >= 400) {
      satEquivalent = '550+ SAT Verbal';
    } else if (score >= 200) {
      satEquivalent = '500+ SAT Verbal';
    } else if (score >= 100) {
      satEquivalent = '450+ SAT Verbal';
    } else if (score >= 50) {
      satEquivalent = '400+ SAT Verbal';
    }
    
    return {
      score,
      masteredWords: stats.mastered,
      learningWords: stats.learning,
      totalWords: stats.total,
      satEquivalent
    };
  } catch (error) {
    console.error('Error calculating vocabulary score:', error);
    return {
      score: 0,
      masteredWords: 0,
      learningWords: 0,
      totalWords: 0,
      satEquivalent: 'Beginning'
    };
  }
};

// Get progress toward SAT goals
export const getSATProgress = async () => {
  try {
    const data = await getSpacedRepetitionData();
    const wordsArray = Object.values(data);
    
    // Count SAT words that are mastered
    const satWordsMastered = wordsArray.filter(word => {
      const wordData = getWordData(word.word);
      return wordData && wordData.isSATWord && word.masteryLevel === 'mastered';
    }).length;
    
    // Essential SAT words target: 500
    const targetSATWords = 500;
    const progress = Math.min(100, (satWordsMastered / targetSATWords) * 100);
    
    return {
      masteredSATWords: satWordsMastered,
      targetSATWords,
      progress: Math.round(progress)
    };
  } catch (error) {
    console.error('Error getting SAT progress:', error);
    return {
      masteredSATWords: 0,
      targetSATWords: 500,
      progress: 0
    };
  }
};

// Reset spaced repetition data (for testing or user request)
export const resetSpacedRepetition = async () => {
  try {
    await AsyncStorage.removeItem(SPACED_REP_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting spaced repetition:', error);
    return false;
  }
};

export default {
  getSpacedRepetitionData,
  addWordToSpacedRep,
  getWordsForReview,
  recordQuizResult,
  getMasteryStats,
  getWordsByMastery,
  getVocabularyScore,
  getSATProgress,
  resetSpacedRepetition
};
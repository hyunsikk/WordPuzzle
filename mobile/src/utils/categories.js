// categories.js - Category queue management with persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import semanticGroups from '../../assets/semantic_groups.json';

const QUEUE_STORAGE_KEY = 'category_queue';
const QUEUE_INDEX_KEY = 'category_queue_index';

let categoryQueue = [];
let currentIndex = 0;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function initializeCategories() {
  try {
    const savedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    const savedIndex = await AsyncStorage.getItem(QUEUE_INDEX_KEY);

    if (savedQueue && savedIndex !== null) {
      categoryQueue = JSON.parse(savedQueue);
      currentIndex = parseInt(savedIndex, 10);

      // If we've gone through all categories, reshuffle
      if (currentIndex >= categoryQueue.length) {
        await reshuffleQueue();
      }
    } else {
      await reshuffleQueue();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    await reshuffleQueue();
  }
}

async function reshuffleQueue() {
  const allCategories = Object.keys(semanticGroups);
  categoryQueue = shuffleArray(allCategories);
  currentIndex = 0;

  await saveQueueState();
}

async function saveQueueState() {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(categoryQueue));
    await AsyncStorage.setItem(QUEUE_INDEX_KEY, currentIndex.toString());
  } catch (error) {
    console.error('Error saving queue state:', error);
  }
}

export async function getNextCategory(maxAttempts = 50) {
  if (currentIndex >= categoryQueue.length) {
    await reshuffleQueue();
  }

  const categoryName = categoryQueue[currentIndex];
  const words = semanticGroups[categoryName];

  currentIndex++;
  await saveQueueState();

  // Filter words to 3-8 letters, max 10 words, ensure unique
  let filteredWords = [...new Set(words.filter(w => w.length >= 3 && w.length <= 8))];

  if (filteredWords.length < 3) {
    // Skip this category and get next, with recursion limit
    if (maxAttempts <= 1) {
      // Fallback: use whatever words we have, or generate a default category
      console.warn('Could not find category with enough valid words');
      return {
        name: 'word challenge',
        words: ['WORD', 'FIND', 'SEARCH', 'PUZZLE', 'GAME'].slice(0, Math.max(3, filteredWords.length))
      };
    }
    return getNextCategory(maxAttempts - 1);
  }

  if (filteredWords.length > 10) {
    filteredWords = shuffleArray(filteredWords).slice(0, 10);
  }

  return {
    name: categoryName.replace(/_/g, ' '),
    words: filteredWords.map(w => w.toUpperCase())
  };
}

export function getCategoryCount() {
  return Object.keys(semanticGroups).length;
}

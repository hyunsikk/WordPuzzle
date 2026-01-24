// gameState.js - Coin and streak management

import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = 'game_coins';
const STREAK_KEY = 'game_streak';
const LAST_PLAY_KEY = 'last_play_date';

// Coin rewards
export const COIN_PER_WORD = 10;
export const COIN_PER_PUZZLE = 50;
export const COIN_PER_BONUS = 5;
export const COIN_STREAK_BONUS = 20;
export const HINT_COST = 20;

let coins = 0;
let streak = 0;
let lastPlayDate = null;

export async function initializeGameState() {
  try {
    const savedCoins = await AsyncStorage.getItem(COINS_KEY);
    const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
    const savedLastPlay = await AsyncStorage.getItem(LAST_PLAY_KEY);

    coins = savedCoins ? parseInt(savedCoins, 10) : 0;
    streak = savedStreak ? parseInt(savedStreak, 10) : 0;
    lastPlayDate = savedLastPlay || null;

    // Check if streak should be reset
    if (lastPlayDate) {
      const lastDate = new Date(lastPlayDate);
      const now = new Date();
      const diffHours = (now - lastDate) / (1000 * 60 * 60);

      if (diffHours > 48) {
        // More than 48 hours - reset streak
        streak = 0;
        await saveGameState();
      }
    }

    return { coins, streak };
  } catch (error) {
    console.error('Error loading game state:', error);
    return { coins: 0, streak: 0 };
  }
}

async function saveGameState() {
  try {
    await AsyncStorage.setItem(COINS_KEY, coins.toString());
    await AsyncStorage.setItem(STREAK_KEY, streak.toString());
    if (lastPlayDate) {
      await AsyncStorage.setItem(LAST_PLAY_KEY, lastPlayDate);
    }
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

export function getCoins() {
  return coins;
}

export function getStreak() {
  return streak;
}

export async function addCoins(amount) {
  coins += amount;
  await saveGameState();
  return coins;
}

export async function spendCoins(amount) {
  if (coins >= amount) {
    coins -= amount;
    await saveGameState();
    return true;
  }
  return false;
}

export async function recordPlay() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (lastPlayDate) {
    const lastDate = new Date(lastPlayDate);
    const lastDay = lastDate.toISOString().split('T')[0];

    if (lastDay !== today) {
      // Different day - check if consecutive
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increase streak
        streak += 1;
      } else if (diffDays > 1) {
        // Gap - reset streak
        streak = 1;
      }
      // Same day - don't change streak
    }
  } else {
    // First play ever
    streak = 1;
  }

  lastPlayDate = now.toISOString();
  await saveGameState();
  return streak;
}

export async function resetGameState() {
  coins = 0;
  streak = 0;
  lastPlayDate = null;
  await AsyncStorage.multiRemove([COINS_KEY, STREAK_KEY, LAST_PLAY_KEY]);
}

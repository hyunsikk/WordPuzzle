// gameState.js - Coin management

import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = 'game_coins';

// Coin rewards
export const COIN_PER_WORD = 10;
export const COIN_PER_PUZZLE = 50;
export const COIN_PER_BONUS = 5;
export const HINT_COST = 20;

let coins = 0;

export async function initializeGameState() {
  try {
    const savedCoins = await AsyncStorage.getItem(COINS_KEY);
    coins = savedCoins ? parseInt(savedCoins, 10) : 0;
    return { coins };
  } catch (error) {
    console.error('Error loading game state:', error);
    return { coins: 0 };
  }
}

async function saveGameState() {
  try {
    await AsyncStorage.setItem(COINS_KEY, coins.toString());
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

export function getCoins() {
  return coins;
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

export async function resetGameState() {
  coins = 0;
  await AsyncStorage.removeItem(COINS_KEY);
}

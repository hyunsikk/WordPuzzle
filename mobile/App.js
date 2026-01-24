// App.js - Vocab Bubbles by AM Studio

import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import { initializeCategories } from './src/utils/categories';
import { initializeGameState, getCoins, getStreak } from './src/utils/gameState';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [initialized, setInitialized] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function init() {
      await initializeCategories();
      const state = await initializeGameState();
      setCoins(state.coins);
      setStreak(state.streak);
      setInitialized(true);
    }
    init();
  }, []);

  const handlePlay = () => {
    setScreen('game');
  };

  const handleCoinsChange = (newCoins) => {
    setCoins(newCoins);
  };

  if (!initialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {screen === 'home' ? (
        <HomeScreen
          onPlay={handlePlay}
          coins={coins}
          streak={streak}
        />
      ) : (
        <GameScreen onCoinsChange={handleCoinsChange} />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

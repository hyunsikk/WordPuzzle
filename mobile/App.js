// App.js - Vocab Bubbles by AM Studio

import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeCategories } from './src/utils/categories';
import { initializeGameState, getCoins } from './src/utils/gameState';
import { initializeAds } from './src/utils/ads';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [initialized, setInitialized] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    async function init() {
      await initializeCategories();
      const state = await initializeGameState();
      setCoins(state.coins);
      setInitialized(true);
    }
    init();

    // Initialize ads
    const unsubscribeAds = initializeAds();
    return () => unsubscribeAds();
  }, []);

  const handlePlay = () => {
    setScreen('game');
  };

  const handleBack = () => {
    // Refresh coins when returning to home
    setCoins(getCoins());
    setScreen('home');
  };

  const handleCoinsChange = (newCoins) => {
    setCoins(newCoins);
  };

  if (!initialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        {screen === 'home' ? (
          <HomeScreen onPlay={handlePlay} />
        ) : (
          <GameScreen onCoinsChange={handleCoinsChange} onBack={handleBack} />
        )}
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

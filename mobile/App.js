// App.js - Word Puzzle: SAT Vocab by AM Studio

import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import StatsScreen from './src/screens/StatsScreen';
import WordsLearnedScreen from './src/screens/WordsLearnedScreen';
import QuizScreen from './src/screens/QuizScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeCategories } from './src/utils/categories';
import { initializeGameState, getCoins } from './src/utils/gameState';
import { initializeAds } from './src/utils/ads';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [initialized, setInitialized] = useState(false);
  const [coins, setCoins] = useState(0);

  // Load Nunito fonts with fallback
  let [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  // Add fallback to prevent hanging on font load failure
  useEffect(() => {
    const fontTimeout = setTimeout(() => {
      if (!fontsLoaded) {
        fontsLoaded = true;
        console.warn('Font loading timeout - continuing with system fonts');
      }
    }, 5000);

    return () => clearTimeout(fontTimeout);
  }, []);

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

  const handleStats = () => {
    setScreen('stats');
  };

  const handleWordsLearned = () => {
    setScreen('words');
  };

  const handleQuiz = () => {
    setScreen('quiz');
  };

  const handleCoinsChange = (newCoins) => {
    setCoins(newCoins);
  };

  // Loading screen while fonts and data load
  if (!fontsLoaded || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        {screen === 'home' && (
          <HomeScreen
            onPlay={handlePlay}
            onStats={handleStats}
            onWordsLearned={handleWordsLearned}
            onQuiz={handleQuiz}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            onCoinsChange={handleCoinsChange}
            onBack={handleBack}
          />
        )}
        {screen === 'stats' && (
          <StatsScreen onBack={handleBack} />
        )}
        {screen === 'words' && (
          <WordsLearnedScreen onBack={handleBack} />
        )}
        {screen === 'quiz' && (
          <QuizScreen onBack={handleBack} />
        )}
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2a4a', // Match app background
  },
  loadingText: {
    fontSize: 18,
    color: '#f8f6f0',
    fontWeight: '500',
  },
});

// GameScreen.js - Ocean Bubbles game screen

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import Celebration from '../components/Celebration';
import { colors } from '../styles/colors';
import { generatePuzzle, positionsMatch } from '../utils/puzzle';
import { getNextCategory } from '../utils/categories';
import {
  getCoins,
  getStreak,
  addCoins,
  spendCoins,
  recordPlay,
  COIN_PER_WORD,
  COIN_PER_PUZZLE,
  HINT_COST,
} from '../utils/gameState';
import {
  showInterstitialAd,
  showRewardedAd,
  isRewardedReady,
  onPuzzleCompleted,
  BANNER_AD_UNIT_ID,
} from '../utils/ads';

const REWARDED_COINS = 50; // Coins given for watching a rewarded ad

export default function GameScreen({ onCoinsChange }) {
  const gameAreaRef = useRef(null);
  const [puzzle, setPuzzle] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [coinAnimation, setCoinAnimation] = useState(null);

  useEffect(() => {
    setCoins(getCoins());
    setStreak(getStreak());
  }, []);

  const loadNewPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);
    setShowCelebration(false);
    setBonusCount(0);

    try {
      const category = await getNextCategory();
      setCategoryName(category.name);

      const newPuzzle = generatePuzzle(category.words);
      setPuzzle(newPuzzle);

      // Record play for streak
      const newStreak = await recordPlay();
      setStreak(newStreak);
    } catch (err) {
      console.error('Error loading puzzle:', err);
      setError(err.message || 'Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const handleSelectionChange = useCallback((cells) => {
    setSelectedCells(cells);
  }, []);

  const handleSelectionEnd = useCallback(async (cells) => {
    if (!puzzle || cells.length < 2) {
      setSelectedCells([]);
      return;
    }

    // Check if selection matches any word
    for (const placement of puzzle.placements) {
      if (foundWords.includes(placement.word)) continue;

      if (positionsMatch(cells, placement.positions)) {
        // Found a word!
        setFoundWords(prev => [...prev, placement.word]);
        setFoundCells(prev => [...prev, ...placement.positions]);
        setSelectedCells([]);

        // Add coins
        const newCoins = await addCoins(COIN_PER_WORD);
        setCoins(newCoins);
        setCoinAnimation(`+${COIN_PER_WORD}`);
        setTimeout(() => setCoinAnimation(null), 1000);

        if (onCoinsChange) onCoinsChange(newCoins);

        // Check if all words found
        if (foundWords.length + 1 === puzzle.words.length) {
          // Puzzle complete bonus
          const finalCoins = await addCoins(COIN_PER_PUZZLE);
          setCoins(finalCoins);
          if (onCoinsChange) onCoinsChange(finalCoins);

          setTimeout(() => {
            setShowCelebration(true);
          }, 500);
        }
        return;
      }
    }

    // No match, clear selection
    setSelectedCells([]);
  }, [puzzle, foundWords, onCoinsChange]);

  const handleCelebrationComplete = useCallback(async () => {
    // Check if we should show an interstitial ad
    if (onPuzzleCompleted()) {
      await showInterstitialAd();
    }
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const showHint = useCallback((unfoundWord) => {
    // Highlight a random cell from the unfound word briefly
    const hintCell = unfoundWord.positions[0];
    setSelectedCells([hintCell]);
    setTimeout(() => setSelectedCells([]), 1500);
  }, []);

  const handleHint = useCallback(async () => {
    if (!puzzle) return;

    // Find an unfound word
    const unfoundWord = puzzle.placements.find(p => !foundWords.includes(p.word));
    if (!unfoundWord) return;

    // If user has enough coins, use them
    if (coins >= HINT_COST) {
      const success = await spendCoins(HINT_COST);
      if (success) {
        const newCoins = getCoins();
        setCoins(newCoins);
        if (onCoinsChange) onCoinsChange(newCoins);
        showHint(unfoundWord);
      }
    } else {
      // Offer to watch a rewarded ad for coins
      if (isRewardedReady()) {
        Alert.alert(
          'Need more coins!',
          `Watch a short video to earn ${REWARDED_COINS} coins?`,
          [
            { text: 'No thanks', style: 'cancel' },
            {
              text: 'Watch Video',
              onPress: async () => {
                const shown = await showRewardedAd(async () => {
                  // Reward callback - give coins
                  const newCoins = await addCoins(REWARDED_COINS);
                  setCoins(newCoins);
                  if (onCoinsChange) onCoinsChange(newCoins);
                  setCoinAnimation(`+${REWARDED_COINS}`);
                  setTimeout(() => setCoinAnimation(null), 1000);
                });
                if (!shown) {
                  Alert.alert('Oops', 'Video not ready. Try again later.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Not enough coins',
          `You need ${HINT_COST} coins for a hint. Keep finding words to earn more!`
        );
      }
    }
  }, [coins, puzzle, foundWords, onCoinsChange, showHint]);

  const handleSnapshot = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: use html2canvas approach
        const html2canvas = (await import('html2canvas')).default;
        const element = document.querySelector('[data-game-area]');
        if (element) {
          const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2,
          });
          const link = document.createElement('a');
          link.download = `word-search-${categoryName}-${Date.now()}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.9);
          link.click();
        }
      } else {
        // Native: use react-native-view-shot
        const uri = await captureRef(gameAreaRef, {
          format: 'jpg',
          quality: 0.9,
        });

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Saved!', 'Screenshot saved to your photo library.');
        } else {
          Alert.alert('Permission needed', 'Please allow photo library access to save screenshots.');
        }
      }
    } catch (err) {
      console.error('Snapshot error:', err);
      Alert.alert('Error', 'Could not capture screenshot.');
    }
  }, [categoryName]);

  const handleSkip = useCallback(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  if (loading || !puzzle) {
    return (
      <LinearGradient
        colors={[colors.backgroundStart, colors.backgroundEnd]}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBubble}>
            <Text style={styles.loadingText}>
              {error ? `Error: ${error}` : 'Loading...'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}> day{streak !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.categoryName}>{categoryName}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{coins}</Text>
          {coinAnimation && (
            <Text style={styles.coinAnimation}>{coinAnimation}</Text>
          )}
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} ref={gameAreaRef} dataSet={{ gameArea: true }}>
        <Grid
          grid={puzzle.grid}
          selectedCells={selectedCells}
          foundCells={foundCells}
          onSelectionChange={handleSelectionChange}
          onSelectionEnd={handleSelectionEnd}
        />

        <WordList
          words={puzzle.words}
          foundWords={foundWords}
          bonusCount={bonusCount}
        />

        {/* Button Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleHint}
          >
            <Text style={styles.buttonIcon}>💡</Text>
            <Text style={styles.buttonText}>Hint ({HINT_COST})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSnapshot}
          >
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={styles.buttonText}>Snapshot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSkip}
          >
            <Text style={styles.buttonIcon}>⏭️</Text>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Celebration
        visible={showCelebration}
        onComplete={handleCelebrationComplete}
      />

      {/* Banner Ad */}
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </LinearGradient>
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
  },
  loadingBubble: {
    backgroundColor: colors.panelBackground,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  coinAnimation: {
    position: 'absolute',
    right: -20,
    top: -10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.coinGold,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

// GameScreen.js - Ocean Bubbles game screen

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Grid from '../components/Grid';
import WordList from '../components/WordList';
import Celebration from '../components/Celebration';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';
import { generatePuzzle, positionsMatch } from '../utils/puzzle';
import { getNextCategory } from '../utils/categories';
import {
  getCoins,
  addCoins,
  spendCoins,
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
  BANNER_SIZE,
  BannerAd,
} from '../utils/ads';
import { recordPuzzleCompletion, addLearnedWord } from '../utils/stats';
import { getFormattedDefinition } from '../utils/definitions';
import { addWordToSpacedRep } from '../utils/spacedRepetition';
import { successFeedback, lightImpact, mediumImpact, errorFeedback } from '../utils/haptics';

const REWARDED_COINS = 50; // Coins given for watching a rewarded ad
const NO_HINT_BONUS = 25; // Bonus for completing without hints
const COMBO_WINDOW = 5000; // 5 seconds window for combo
const COMBO_BASE_BONUS = 5; // Base bonus per combo level

export default function GameScreen({ onCoinsChange, onBack }) {
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
  const [coinAnimation, setCoinAnimation] = useState(null);
  const [hintCells, setHintCells] = useState([]);
  const [usedHint, setUsedHint] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [totalComboBonus, setTotalComboBonus] = useState(0);
  const [comboTimeLeft, setComboTimeLeft] = useState(0); // 0-100 percentage
  const lastWordTimeRef = useRef(null);
  const comboTimerRef = useRef(null);
  const puzzleStartTime = useRef(null);
  
  // Word definition modal
  const [showDefinition, setShowDefinition] = useState(false);
  const [currentWordDefinition, setCurrentWordDefinition] = useState(null);
  
  // Animation values
  const celebrationScale = useSharedValue(1);

  useEffect(() => {
    setCoins(getCoins());
  }, []);

  const loadNewPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);
    setHintCells([]);
    setShowCelebration(false);
    setShowDefinition(false);
    setCurrentWordDefinition(null);
    setUsedHint(false);
    setComboCount(0);
    setTotalComboBonus(0);
    setComboTimeLeft(0);
    lastWordTimeRef.current = null;
    puzzleStartTime.current = Date.now();
    celebrationScale.value = 1;
    
    if (comboTimerRef.current) {
      clearInterval(comboTimerRef.current);
      comboTimerRef.current = null;
    }

    try {
      const category = await getNextCategory();
      setCategoryName(category.name);

      const newPuzzle = generatePuzzle(category.words);
      setPuzzle(newPuzzle);
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
        // Found a word! Success haptic feedback
        successFeedback();
        
        // Add word to learned words (tracks in AsyncStorage)
        await addLearnedWord(placement.word);
        
        // Add word to spaced repetition system for quiz learning
        const definition = getFormattedDefinition(placement.word);
        if (definition.hasDefinition) {
          await addWordToSpacedRep(placement.word, definition.definition);
        }

        const wordIndex = foundWords.length; // Index of this word (0-based)
        setFoundWords(prev => [...prev, placement.word]);
        setFoundCells(prev => [
          ...prev,
          ...placement.positions.map(pos => ({ ...pos, wordIndex })),
        ]);
        setSelectedCells([]);

        // Show word definition immediately
        const definition = getFormattedDefinition(placement.word);
        setCurrentWordDefinition(definition);
        setShowDefinition(true);
        
        // Auto-hide definition after 3 seconds
        setTimeout(() => {
          setShowDefinition(false);
        }, 3000);

        // Check for combo
        const now = Date.now();
        let comboBonus = 0;
        let newComboCount = 0;

        if (lastWordTimeRef.current && (now - lastWordTimeRef.current) < COMBO_WINDOW) {
          // Within combo window - increment combo
          newComboCount = comboCount + 1;
          comboBonus = newComboCount * COMBO_BASE_BONUS;
          setComboCount(newComboCount);
          setTotalComboBonus(prev => prev + comboBonus);
        } else {
          // Reset combo (this is first word or too slow)
          setComboCount(1);
          newComboCount = 1;
        }
        lastWordTimeRef.current = now;

        // Start/reset combo timer
        if (comboTimerRef.current) {
          clearInterval(comboTimerRef.current);
        }
        setComboTimeLeft(100);
        comboTimerRef.current = setInterval(() => {
          setComboTimeLeft(prev => {
            if (prev <= 2) {
              clearInterval(comboTimerRef.current);
              comboTimerRef.current = null;
              return 0;
            }
            return prev - 2; // Decrements every 100ms, 50 steps = 5 seconds
          });
        }, 100);

        // Add coins (base + combo bonus)
        const totalEarned = COIN_PER_WORD + comboBonus;
        const newCoins = await addCoins(totalEarned);
        setCoins(newCoins);

        // Show animation with combo info
        if (comboBonus > 0) {
          setCoinAnimation(`+${COIN_PER_WORD} +${comboBonus} combo!`);
        } else {
          setCoinAnimation(`+${COIN_PER_WORD}`);
        }
        setTimeout(() => setCoinAnimation(null), 1500);

        if (onCoinsChange) onCoinsChange(newCoins);

        // Check if all words found
        if (foundWords.length + 1 === puzzle.words.length) {
          // Puzzle complete - celebration haptic sequence
          successFeedback();
          
          // Trigger celebration animation
          celebrationScale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
          setTimeout(() => {
            celebrationScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }, 200);

          // Puzzle complete bonus + no-hint bonus if applicable
          let completionBonus = COIN_PER_PUZZLE;
          if (!usedHint) {
            completionBonus += NO_HINT_BONUS;
          }

          const finalCoins = await addCoins(completionBonus);
          setCoins(finalCoins);
          if (onCoinsChange) onCoinsChange(finalCoins);

          // Record puzzle completion stats
          const playTimeMinutes = (Date.now() - puzzleStartTime.current) / 60000;
          await recordPuzzleCompletion(
            foundWords.length + 1, // total words found
            puzzle.words.length, // total words in puzzle
            usedHint ? 1 : 0, // hints used
            playTimeMinutes
          );

          setTimeout(() => {
            setShowCelebration(true);
          }, 500);
        }
        return;
      }
    }

    // No match, clear selection
    setSelectedCells([]);
    // Light error feedback for invalid selection
    if (cells.length >= 3) {
      errorFeedback();
    }
  }, [puzzle, foundWords, onCoinsChange, comboCount, usedHint]);

  const handleCelebrationComplete = useCallback(async () => {
    // Check if we should show an interstitial ad
    if (onPuzzleCompleted()) {
      await showInterstitialAd();
    }
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const showHint = useCallback((unfoundWord) => {
    // Highlight the first cell of the unfound word briefly with yellow
    const hintCell = unfoundWord.positions[0];
    setHintCells([hintCell]);
    setTimeout(() => setHintCells([]), 1500);
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
        setUsedHint(true); // Mark that hint was used
        const newCoins = getCoins();
        setCoins(newCoins);
        if (onCoinsChange) onCoinsChange(newCoins);
        showHint(unfoundWord);
        lightImpact(); // Haptic feedback for hint usage
      }
    } else {
      // Offer to watch a rewarded ad for coins
      if (isRewardedReady()) {
        Alert.alert(
          'Need more coins!',
          `Watch a short video to earn ${REWARDED_COINS} coins?`,
          [
            { text: 'No thanks', style: 'cancel', onPress: () => lightImpact() },
            {
              text: 'Watch Video',
              onPress: async () => {
                lightImpact();
                const shown = await showRewardedAd(async () => {
                  // Reward callback - give coins
                  const newCoins = await addCoins(REWARDED_COINS);
                  setCoins(newCoins);
                  if (onCoinsChange) onCoinsChange(newCoins);
                  setCoinAnimation(`+${REWARDED_COINS}`);
                  setTimeout(() => setCoinAnimation(null), 1000);
                  successFeedback(); // Haptic for successful coin earning
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
    lightImpact();
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
    mediumImpact();
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const handleBackPress = useCallback(() => {
    lightImpact();
    onBack();
  }, [onBack]);

  if (loading || !puzzle) {
    return (
      <LinearGradient
        colors={[colors.backgroundStart, colors.backgroundEnd]}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBubble}>
            <Text style={Typography.body}>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel="Go back to home screen"
          accessibilityRole="button"
        >
          <Text style={Typography.subheading}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={Typography.subheading}>{categoryName}</Text>
        </View>

        <View style={styles.headerStats}>
          {comboCount > 1 && (
            <View style={styles.comboIndicator}>
              <Text style={styles.comboText}>🔥 x{comboCount}</Text>
              {comboTimeLeft > 0 && (
                <View style={styles.comboTimerBar}>
                  <View style={[styles.comboTimerFill, { width: `${comboTimeLeft}%` }]} />
                </View>
              )}
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{coins}</Text>
          </View>
        </View>
      </View>

      {/* Coin Toast */}
      {coinAnimation && (
        <View style={styles.coinToast}>
          <Text style={Typography.button}>{coinAnimation}</Text>
        </View>
      )}

      {/* Game Area */}
      <View style={styles.gameArea} ref={gameAreaRef} dataSet={{ gameArea: true }}>
        <Grid
          grid={puzzle.grid}
          selectedCells={selectedCells}
          foundCells={foundCells}
          hintCells={hintCells}
          onSelectionChange={handleSelectionChange}
          onSelectionEnd={handleSelectionEnd}
        />

        <WordList
          words={puzzle.words}
          foundWords={foundWords}
          bonusCount={totalComboBonus}
        />

        {/* Button Row */}
        <View style={styles.buttonRow}>
          <View style={styles.hintButtonContainer}>
            {!usedHint && (
              <View style={styles.noHintBadge}>
                <Text style={styles.noHintBonusText}>+{NO_HINT_BONUS} bonus</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleHint}
              accessibilityLabel={`Get hint for ${HINT_COST} coins`}
              accessibilityRole="button"
            >
              <Text style={styles.buttonIcon}>💡</Text>
              <Text style={Typography.caption}>Hint ({HINT_COST})</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSnapshot}
            accessibilityLabel="Take a screenshot of the puzzle"
            accessibilityRole="button"
          >
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={Typography.caption}>Snapshot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSkip}
            accessibilityLabel="Skip to next puzzle"
            accessibilityRole="button"
          >
            <Text style={styles.buttonIcon}>⏭️</Text>
            <Text style={Typography.caption}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Celebration
        visible={showCelebration}
        onComplete={handleCelebrationComplete}
        bonusCoins={COIN_PER_PUZZLE}
        noHintBonus={usedHint ? 0 : NO_HINT_BONUS}
        comboBonus={totalComboBonus}
      />

      {/* Word Definition Modal */}
      <Modal
        visible={showDefinition}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDefinition(false)}
      >
        <View style={styles.definitionOverlay}>
          <Animated.View style={[styles.definitionCard, {
            transform: [{ scale: celebrationScale }]
          }]}>
            <TouchableOpacity
              style={styles.definitionClose}
              onPress={() => {
                lightImpact();
                setShowDefinition(false);
              }}
            >
              <Text style={Typography.caption}>✕</Text>
            </TouchableOpacity>
            
            {currentWordDefinition && (
              <>
                <Text style={Typography.wordTitle}>
                  {currentWordDefinition.word}
                </Text>
                <Text style={Typography.definition}>
                  {currentWordDefinition.definition}
                </Text>
                {!currentWordDefinition.hasDefinition && (
                  <Text style={[Typography.small, styles.noDefinitionNote]}>
                    💭 Keep learning! This word builds your vocabulary.
                  </Text>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Banner Ad - Native only */}
      {BannerAd && (
        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BANNER_SIZE}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60, // Reserve space for banner ad
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
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comboIndicator: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  comboText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  comboTimerBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  comboTimerFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
  coinToast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: colors.coinGold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  coinToastText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    alignItems: 'flex-end',
    marginTop: 16,
    marginBottom: 30,
    paddingHorizontal: 16,
    gap: 12,
  },
  hintButtonContainer: {
    alignItems: 'center',
  },
  noHintBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  noHintBonusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333333',
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
  
  // Definition modal styles
  definitionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 32,
  },
  definitionCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  definitionClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  noDefinitionNote: {
    marginTop: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

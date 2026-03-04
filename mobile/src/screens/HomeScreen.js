// HomeScreen.js - Premium Scholar theme with Learning Layer

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';
import { getStats, getStreakInfo } from '../utils/stats';
import { getVocabularyScore, getSATProgress, getWordsForReview } from '../utils/spacedRepetition';
import { getWordOfTheDay, addWordOfTheDayToQueue } from '../utils/wordOfTheDay';
import { lightImpact, mediumImpact } from '../utils/haptics';

export default function HomeScreen({ onPlay, onStats, onWordsLearned, onQuiz }) {
  const [stats, setStats] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [vocabularyScore, setVocabularyScore] = useState(null);
  const [satProgress, setSATProgress] = useState(null);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [wordsForReview, setWordsForReview] = useState(0);
  
  // Breathing animation for bubbles
  const breathingScale = useSharedValue(1);
  
  useEffect(() => {
    loadData();
    
    // Start breathing animation
    breathingScale.value = withRepeat(
      withTiming(1.03, { duration: 3000 }),
      -1,
      true
    );
  }, []);
  
  const loadData = async () => {
    try {
      const [
        statsData, 
        streakData, 
        vocabScore, 
        satProgressData, 
        todayWord,
        reviewWords
      ] = await Promise.all([
        getStats(),
        getStreakInfo(),
        getVocabularyScore(),
        getSATProgress(),
        getWordOfTheDay(),
        getWordsForReview(1) // Just count
      ]);
      
      setStats(statsData);
      setStreakInfo(streakData);
      setVocabularyScore(vocabScore);
      setSATProgress(satProgressData);
      setWordOfTheDay(todayWord);
      setWordsForReview(reviewWords.length);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };
  
  const handlePlayPress = () => {
    mediumImpact();
    onPlay();
  };
  
  const handleStatsPress = () => {
    lightImpact();
    onStats();
  };
  
  const handleWordsPress = () => {
    lightImpact();
    onWordsLearned();
  };

  const handleQuizPress = () => {
    mediumImpact();
    onQuiz();
  };

  const handleWordOfTheDayPress = async () => {
    lightImpact();
    const added = await addWordOfTheDayToQueue();
    if (added) {
      // Reload data to update counts
      loadData();
    }
  };
  
  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));
  
  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Elegant floating elements with breathing animation */}
      <View style={styles.floatingDecor}>
        <Animated.View style={[styles.decorElement, styles.element1, animatedBubbleStyle]} />
        <Animated.View style={[styles.decorElement, styles.element2, animatedBubbleStyle]} />
        <Animated.View style={[styles.decorElement, styles.element3, animatedBubbleStyle]} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Title - Premium typography treatment */}
        <View style={styles.titleContainer}>
          <Text style={Typography.headingLight}>Word Puzzle: SAT Vocab</Text>
          <Text style={Typography.captionLight}>Scholarly Word Search</Text>
        </View>

        {/* Vocabulary Score Card - Premium emphasis */}
        {vocabularyScore && (
          <View style={styles.scoreCard}>
            <Text style={Typography.subheading}>Vocabulary Mastery</Text>
            <Text style={Typography.scoreValue}>{vocabularyScore.score}</Text>
            <Text style={Typography.caption}>{vocabularyScore.satEquivalent}</Text>
            <View style={styles.scoreDetails}>
              <Text style={Typography.small}>
                {vocabularyScore.masteredWords} mastered • {vocabularyScore.learningWords} learning
              </Text>
            </View>
          </View>
        )}

        {/* SAT/GRE Progress Card */}
        {satProgress && (
          <View style={styles.progressCard}>
            <Text style={Typography.subheading}>SAT Progress</Text>
            <Text style={Typography.caption}>
              {satProgress.masteredSATWords} / {satProgress.targetSATWords} essential words mastered
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressBarFill, { width: `${satProgress.progress}%` }]} />
              </View>
              <Text style={Typography.small}>{satProgress.progress}%</Text>
            </View>
          </View>
        )}

        {/* Word of the Day Card - Featured prominently */}
        {wordOfTheDay && (
          <TouchableOpacity 
            style={styles.wordOfTheDayCard}
            onPress={handleWordOfTheDayPress}
            activeOpacity={0.9}
          >
            <View style={styles.wordOfTheDayHeader}>
              <Text style={Typography.subheading}>Word of the Day</Text>
              {!wordOfTheDay.isInLearning && (
                <Text style={styles.addToQueueHint}>Tap to learn</Text>
              )}
            </View>
            <Text style={Typography.wordOfTheDay}>{wordOfTheDay.word}</Text>
            {wordOfTheDay.pronunciation && (
              <Text style={styles.pronunciation}>/{wordOfTheDay.pronunciation}/</Text>
            )}
            <Text style={Typography.definition}>{wordOfTheDay.definition}</Text>
            {wordOfTheDay.exampleSentence && (
              <Text style={styles.exampleSentence}>"{wordOfTheDay.exampleSentence}"</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Daily streak indicator */}
        {streakInfo && (
          <View style={styles.streakContainer}>
            <Text style={[Typography.subheadingLight, styles.streakText]}>
              {streakInfo.text}
            </Text>
            {!streakInfo.playedToday && streakInfo.currentStreak > 0 && (
              <Text style={Typography.captionLight}>
                Play today to keep your streak!
              </Text>
            )}
          </View>
        )}

        {/* Main Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPress}
            activeOpacity={0.8}
            accessibilityLabel="Start playing Word Puzzle: SAT Vocab"
            accessibilityRole="button"
          >
            <Text style={Typography.button}>Play Puzzle</Text>
          </TouchableOpacity>

          {/* Quiz Button - only show if there are words to review */}
          {wordsForReview > 0 && (
            <TouchableOpacity
              style={styles.quizButton}
              onPress={handleQuizPress}
              activeOpacity={0.8}
              accessibilityLabel="Start vocabulary quiz"
              accessibilityRole="button"
            >
              <Text style={[Typography.button, styles.quizButtonText]}>
                Quiz ({wordsForReview} due)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats row */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={Typography.small}>Puzzles</Text>
              <Text style={Typography.coin}>{stats.puzzlesCompleted}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={Typography.small}>Words Found</Text>
              <Text style={Typography.coin}>{stats.wordsLearned}</Text>
            </View>
            {streakInfo && streakInfo.currentStreak > 0 && (
              <View style={styles.statItem}>
                <Text style={Typography.small}>Streak</Text>
                <Text style={Typography.streak}>
                  {streakInfo.emoji} {streakInfo.currentStreak}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleStatsPress}
            accessibilityLabel="View statistics"
            accessibilityRole="button"
          >
            <Text style={styles.navButtonIcon}>📊</Text>
            <Text style={Typography.captionLight}>Stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleWordsPress}
            accessibilityLabel="View learned words"
            accessibilityRole="button"
          >
            <Text style={styles.navButtonIcon}>📚</Text>
            <Text style={Typography.captionLight}>Words</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24, // Premium spacing
    paddingBottom: 120, // More generous bottom padding
  },
  floatingDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorElement: {
    position: 'absolute',
    backgroundColor: 'rgba(248, 246, 240, 0.08)', // Warm, subtle elements
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)', // Subtle gold border
  },
  element1: {
    width: 120,
    height: 120,
    top: '12%',
    left: '8%',
  },
  element2: {
    width: 80,
    height: 80,
    top: '20%',
    right: '10%',
  },
  element3: {
    width: 160,
    height: 160,
    bottom: '15%',
    right: '5%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48, // More generous spacing
  },
  scoreCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 24, // Larger radius for premium feel
    padding: 32, // More generous padding
    marginBottom: 32, // Increased spacing between cards
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 }, // Deeper shadow
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreDetails: {
    marginTop: 8,
  },
  progressCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.panelBorder,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  wordOfTheDayCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  wordOfTheDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addToQueueHint: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: colors.buttonPrimary,
  },
  wordOfTheDayWord: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  exampleSentence: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  streakText: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },
  playButton: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 40,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  quizButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 40,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: colors.buttonText,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  navButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
});

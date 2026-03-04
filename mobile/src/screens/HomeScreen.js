// HomeScreen.js - Ocean Bubbles theme

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
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
import { lightImpact, mediumImpact } from '../utils/haptics';

export default function HomeScreen({ onPlay, onStats, onWordsLearned }) {
  const [stats, setStats] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  
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
      const [statsData, streakData] = await Promise.all([
        getStats(),
        getStreakInfo(),
      ]);
      setStats(statsData);
      setStreakInfo(streakData);
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
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Decorative bubbles with breathing animation */}
        <View style={styles.bubbleDecor}>
          <Animated.View style={[styles.decorBubble, styles.bubble1, animatedBubbleStyle]} />
          <Animated.View style={[styles.decorBubble, styles.bubble2, animatedBubbleStyle]} />
          <Animated.View style={[styles.decorBubble, styles.bubble3, animatedBubbleStyle]} />
        </View>

        {/* Stats row */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={Typography.small}>Puzzles</Text>
              <Text style={Typography.coin}>{stats.puzzlesCompleted}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={Typography.small}>Words</Text>
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

        <View style={styles.titleContainer}>
          <Text style={Typography.headingLight}>Vocab Bubbles</Text>
          <Text style={Typography.captionLight}>SAT & GRE Word Search</Text>
        </View>

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

        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPress}
          activeOpacity={0.8}
          accessibilityLabel="Start playing Vocab Bubbles"
          accessibilityRole="button"
        >
          <Text style={Typography.button}>Play</Text>
        </TouchableOpacity>
        
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bubbleDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
  },
  bubble1: {
    width: 80,
    height: 80,
    top: '15%',
    left: '10%',
  },
  bubble2: {
    width: 60,
    height: 60,
    top: '25%',
    right: '15%',
  },
  bubble3: {
    width: 100,
    height: 100,
    bottom: '20%',
    right: '5%',
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  playButton: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 80,
    paddingVertical: 20,
    borderRadius: 40,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 40,
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

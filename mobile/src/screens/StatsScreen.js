// StatsScreen.js - Statistics and progress tracking screen
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';
import { getStats, getDailyActivity, getStreakInfo } from '../utils/stats';
import { lightImpact } from '../utils/haptics';

const { width: screenWidth } = Dimensions.get('window');

export default function StatsScreen({ onBack }) {
  const [stats, setStats] = useState(null);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [streakInfo, setStreakInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, activityData, streakData] = await Promise.all([
        getStats(),
        getDailyActivity(7),
        getStreakInfo(),
      ]);
      
      setStats(statsData);
      setDailyActivity(activityData);
      setStreakInfo(streakData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    lightImpact();
    onBack();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.backgroundStart, colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading stats...</Text>
        </View>
      </LinearGradient>
    );
  }

  const StatCard = ({ title, value, subtitle, icon }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={Typography.caption}>{title}</Text>
      </View>
      <Text style={Typography.subheading}>{value}</Text>
      {subtitle && <Text style={Typography.small}>{subtitle}</Text>}
    </View>
  );

  const ActivityBar = ({ activity, maxValue, index }) => {
    const height = maxValue > 0 ? Math.max(8, (activity.words / maxValue) * 60) : 8;
    const date = new Date(activity.date);
    const dayAbbr = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
    
    return (
      <View style={styles.activityBarContainer}>
        <View
          style={[
            styles.activityBar,
            {
              height,
              backgroundColor: activity.words > 0 ? colors.accent : colors.panelBorder,
            },
          ]}
        />
        <Text style={Typography.small}>{dayAbbr}</Text>
      </View>
    );
  };

  const maxWords = Math.max(...dailyActivity.map(d => d.words), 1);

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={Typography.subheading}>←</Text>
          </TouchableOpacity>
          <Text style={Typography.heading}>Your Progress</Text>
        </View>

        {/* Streak Card */}
        {streakInfo && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>{streakInfo.emoji}</Text>
            <Text style={Typography.subheading}>{streakInfo.text}</Text>
            <Text style={Typography.caption}>
              Best streak: {streakInfo.bestStreak} days
            </Text>
          </View>
        )}

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Puzzles Completed"
            value={stats.puzzlesCompleted}
            icon="🧩"
          />
          <StatCard
            title="Words Learned"
            value={stats.wordsLearned}
            icon="📚"
          />
          <StatCard
            title="Accuracy"
            value={`${stats.accuracy.toFixed(1)}%`}
            icon="🎯"
          />
          <StatCard
            title="Perfect Puzzles"
            value={stats.perfectPuzzles}
            subtitle="No hints used"
            icon="⭐"
          />
        </View>

        {/* Daily Activity Chart */}
        <View style={styles.activitySection}>
          <Text style={Typography.subheading}>Daily Activity (7 days)</Text>
          <View style={styles.activityChart}>
            {dailyActivity.map((activity, index) => (
              <ActivityBar
                key={activity.date}
                activity={activity}
                maxValue={maxWords}
                index={index}
              />
            ))}
          </View>
          <Text style={Typography.small}>
            Total words found this week: {dailyActivity.reduce((sum, d) => sum + d.words, 0)}
          </Text>
        </View>

        {/* Additional Stats */}
        <View style={styles.additionalStats}>
          <StatCard
            title="Average Words/Puzzle"
            value={stats.averageWordsPerPuzzle.toFixed(1)}
            icon="📊"
          />
          <StatCard
            title="Total Play Time"
            value={`${Math.round(stats.totalPlayTime)} min`}
            icon="⏱️"
          />
          <StatCard
            title="Hints Used"
            value={stats.hintsUsed}
            icon="💡"
          />
        </View>

        {/* Playing Since */}
        {stats.firstPlayDate && (
          <View style={styles.playingSince}>
            <Text style={Typography.caption}>
              Playing since {new Date(stats.firstPlayDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  streakCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: colors.panelBackground,
    borderRadius: 16,
    padding: 16,
    width: (screenWidth - 52) / 2, // Account for padding and gap
    marginBottom: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  activitySection: {
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  activityBarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  activityBar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  additionalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  playingSince: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
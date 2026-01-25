// HomeScreen.js - Ocean Bubbles theme

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

export default function HomeScreen({ onPlay }) {
  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Decorative bubbles */}
        <View style={styles.bubbleDecor}>
          <View style={[styles.decorBubble, styles.bubble1]} />
          <View style={[styles.decorBubble, styles.bubble2]} />
          <View style={[styles.decorBubble, styles.bubble3]} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Vocab Bubbles</Text>
          <Text style={styles.subtitle}>by AM Studio</Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlay}
          activeOpacity={0.8}
          accessibilityLabel="Start playing Vocab Bubbles"
          accessibilityRole="button"
        >
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 40,
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
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
  },
  playButtonText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 2,
  },
});

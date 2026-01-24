// Celebration.js - Ocean Bubbles celebration overlay

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { colors } from '../styles/colors';

export default function Celebration({ visible, onComplete }) {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.message}>Amazing!</Text>
        <Text style={styles.subMessage}>+50 coins bonus</Text>
        <View style={styles.nextHint}>
          <Text style={styles.nextHintText}>Next puzzle loading...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(64, 224, 208, 0.4)',
    zIndex: 1000,
  },
  messageContainer: {
    backgroundColor: colors.panelBackground,
    paddingHorizontal: 50,
    paddingVertical: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  message: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.coinGold,
    marginTop: 8,
  },
  nextHint: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
  nextHintText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

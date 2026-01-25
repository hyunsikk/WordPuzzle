// Celebration.js - Ocean Bubbles celebration overlay

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { colors } from '../styles/colors';

export default function Celebration({
  visible,
  onComplete,
  bonusCoins = 50,
  noHintBonus = 0,
  comboBonus = 0,
}) {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  const totalBonus = bonusCoins + noHintBonus + comboBonus;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Puzzle complete! You earned ${totalBonus} bonus coins`}
      accessibilityRole="alert"
    >
      <View style={styles.messageContainer}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.message}>Amazing!</Text>
        <View style={styles.bonusContainer}>
          <Text style={styles.subMessage}>+{bonusCoins} completion</Text>
          {noHintBonus > 0 && (
            <Text style={styles.bonusLine}>+{noHintBonus} no hints!</Text>
          )}
          {comboBonus > 0 && (
            <Text style={styles.bonusLine}>+{comboBonus} combos!</Text>
          )}
          <Text style={styles.totalMessage}>Total: +{totalBonus} 💎</Text>
        </View>
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
  bonusContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  subMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  bonusLine: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.coinGold,
    marginTop: 4,
  },
  totalMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.coinGold,
    marginTop: 12,
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

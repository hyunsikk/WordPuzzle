// WordList.js - Word panel with checkmarks

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors } from '../styles/colors';

function WordItem({ word, isFound }) {
  return (
    <View style={[styles.wordItem, isFound && styles.wordItemFound]}>
      <View style={[styles.checkbox, isFound && styles.checkboxFound]}>
        {isFound && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.wordText, isFound && styles.wordTextFound]}>
        {word}
      </Text>
    </View>
  );
}

export default function WordList({ words, foundWords, bonusCount = 0 }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Words to Find</Text>
        {bonusCount > 0 && (
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>+{bonusCount} bonus</Text>
          </View>
        )}
      </View>
      <View style={styles.wordGrid}>
        {words.map((word) => (
          <WordItem
            key={word}
            word={word}
            isFound={foundWords.includes(word)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panelBackground,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bonusBadge: {
    backgroundColor: colors.coinGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  wordItemFound: {
    backgroundColor: '#E8F5E9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.bubbleBorder,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFound: {
    backgroundColor: colors.checkmark,
    borderColor: colors.checkmark,
  },
  checkmark: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.wordDefault,
    letterSpacing: 1,
  },
  wordTextFound: {
    color: colors.wordFound,
  },
});

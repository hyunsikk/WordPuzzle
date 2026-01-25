// WordList.js - Word panel with checkmarks

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors } from '../styles/colors';

function WordItem({ word, isFound }) {
  return (
    <View
      style={[styles.wordItem, isFound && styles.wordItemFound]}
      accessibilityLabel={`${word}, ${isFound ? 'found' : 'not found yet'}`}
      accessibilityState={{ checked: isFound }}
    >
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
  const progress = `${foundWords.length}/${words.length}`;

  return (
    <View style={styles.container} accessibilityLabel={`Words to find: ${foundWords.length} of ${words.length} found`}>
      <View style={styles.header}>
        <Text style={styles.title}>Words to Find</Text>
        <View style={styles.headerRight}>
          {bonusCount > 0 && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusText}>🔥 +{bonusCount}</Text>
            </View>
          )}
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{progress}</Text>
          </View>
        </View>
      </View>
      <View style={styles.wordGrid}>
        {words.map((word, index) => (
          <WordItem
            key={`${word}-${index}`}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  progressBadge: {
    backgroundColor: colors.bubbleBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
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

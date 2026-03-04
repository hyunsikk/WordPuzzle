// WordList.js - Word panel with checkmarks

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';

function WordItem({ word, isFound }) {
  return (
    <View
      style={[styles.wordItem, isFound && styles.wordItemFound]}
      accessibilityLabel={`${word}, ${isFound ? 'found' : 'not found yet'}`}
      accessibilityState={{ checked: isFound }}
    >
      <View style={[styles.checkbox, isFound && styles.checkboxFound]}>
        {isFound && <Text style={Typography.small}>✓</Text>}
      </View>
      <Text style={[Typography.caption, { letterSpacing: 1 }, isFound && styles.wordTextFound]}>
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
        <Text style={Typography.caption}>Words to Find</Text>
        <View style={styles.headerRight}>
          {bonusCount > 0 && (
            <View style={styles.bonusBadge}>
              <Text style={Typography.small}>🔥 +{bonusCount}</Text>
            </View>
          )}
          <View style={styles.progressBadge}>
            <Text style={Typography.small}>{progress}</Text>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.wordScrollView}
        contentContainerStyle={styles.wordGrid}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {words.map((word, index) => (
          <WordItem
            key={`${word}-${index}`}
            word={word}
            isFound={foundWords.includes(word)}
          />
        ))}
      </ScrollView>
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
    maxHeight: 225,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wordScrollView: {
    flexGrow: 0,
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
  bonusBadge: {
    backgroundColor: colors.coinGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadge: {
    backgroundColor: colors.bubbleBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  wordTextFound: {
    color: colors.wordFound,
  },
});

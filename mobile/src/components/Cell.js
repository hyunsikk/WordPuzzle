// Cell.js - Bubble letter cell component

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

export default function Cell({ letter, isSelected, isFound, cellSize }) {
  const getBubbleStyle = () => {
    if (isFound) {
      return {
        backgroundColor: colors.bubbleFound,
        borderColor: '#7AC87A',
        transform: [{ scale: 1 }],
      };
    }
    if (isSelected) {
      return {
        backgroundColor: colors.bubbleSelected,
        borderColor: '#E6CC30',
        transform: [{ scale: 1.15 }],
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };
    }
    return {
      backgroundColor: colors.bubbleDefault,
      borderColor: colors.bubbleBorder,
      transform: [{ scale: 1 }],
    };
  };

  return (
    <View
      style={[
        styles.bubble,
        {
          width: cellSize,
          height: cellSize,
          borderRadius: cellSize / 2,
        },
        getBubbleStyle(),
      ]}
    >
      <Text
        style={[
          styles.letter,
          { fontSize: Math.max(14, cellSize * 0.5) },
          isFound && styles.letterFound,
        ]}
      >
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  letter: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  letterFound: {
    color: '#2D5A2D',
  },
});

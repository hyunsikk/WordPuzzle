// Cell.js - Bubble letter cell component

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

function Cell({ letter, isSelected, isFound, isHint, cellSize, foundColorIndex }) {
  const getBubbleStyle = () => {
    // Hint takes highest priority - shows yellow even on found cells
    if (isHint) {
      return {
        backgroundColor: colors.bubbleSelected,
        borderColor: '#E6CC30',
        transform: [{ scale: 1.2 }],
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
      };
    }
    if (isFound) {
      // Use color based on which word this cell belongs to
      const colorPalette = colors.foundWordColors;
      const colorSet = colorPalette[foundColorIndex % colorPalette.length];
      return {
        backgroundColor: colorSet.bg,
        borderColor: colorSet.border,
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

  const getTextColor = () => {
    if (isHint) {
      return { color: colors.textPrimary };
    }
    if (isFound) {
      const colorPalette = colors.foundWordColors;
      const colorSet = colorPalette[foundColorIndex % colorPalette.length];
      return { color: colorSet.text };
    }
    return null;
  };

  const accessibilityState = isFound ? 'found' : isSelected ? 'selected' : 'available';

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
      accessible={true}
      accessibilityLabel={`Letter ${letter}, ${accessibilityState}`}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.letter,
          { fontSize: Math.max(14, cellSize * 0.5) },
          getTextColor(),
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
    margin: 1,
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
});

export default memo(Cell);

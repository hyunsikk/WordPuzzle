// Cell.js - Bubble letter cell component

import React, { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';

function Cell({ letter, isSelected, isFound, isHint, cellSize, foundColorIndex }) {
  // Animation values
  const scale = useSharedValue(1);
  const selectedScale = useSharedValue(1);
  
  // Animate when cell becomes selected or deselected
  useEffect(() => {
    if (isSelected) {
      selectedScale.value = withSpring(1.15, { damping: 15, stiffness: 200 });
    } else {
      selectedScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [isSelected]);
  
  // Animate when word is found
  useEffect(() => {
    if (isFound) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    }
  }, [isFound]);

  const getBubbleStyle = () => {
    // Hint takes highest priority - shows yellow even on found cells
    if (isHint) {
      return {
        backgroundColor: colors.bubbleSelected,
        borderColor: '#E6CC30',
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
      };
    }
    if (isSelected) {
      return {
        backgroundColor: colors.bubbleSelected,
        borderColor: '#E6CC30',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };
    }
    return {
      backgroundColor: colors.bubbleDefault,
      borderColor: colors.bubbleBorder,
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * selectedScale.value * (isHint ? 1.2 : 1) }
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: cellSize,
          height: cellSize,
          borderRadius: cellSize / 2,
        },
        getBubbleStyle(),
        animatedStyle,
      ]}
      accessible={true}
      accessibilityLabel={`Letter ${letter}, ${accessibilityState}`}
      accessibilityRole="button"
    >
      <Text
        style={[
          Typography.button,
          { fontSize: Math.max(14, cellSize * 0.5) },
          getTextColor(),
        ]}
      >
        {letter}
      </Text>
    </Animated.View>
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
});

export default memo(Cell);

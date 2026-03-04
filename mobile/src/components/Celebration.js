// Celebration.js - Ocean Bubbles celebration overlay

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import Typography from '../styles/Typography';

export default function Celebration({
  visible,
  onComplete,
  bonusCoins = 50,
  noHintBonus = 0,
  comboBonus = 0,
}) {
  // Animation values
  const scale = useSharedValue(0);
  const emojiScale = useSharedValue(1);
  const bonusOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate container entrance
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      
      // Animate emoji celebration
      emojiScale.value = withSequence(
        withDelay(200, withSpring(1.3, { damping: 8, stiffness: 200 })),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      // Animate bonus text
      bonusOpacity.value = withDelay(400, withSpring(1, { damping: 20, stiffness: 100 }));
      
      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      emojiScale.value = 1;
      bonusOpacity.value = 0;
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  const totalBonus = bonusCoins + noHintBonus + comboBonus;

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const animatedBonusStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
  }));

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Puzzle complete! You earned ${totalBonus} bonus coins`}
      accessibilityRole="alert"
    >
      <Animated.View style={[styles.messageContainer, animatedContainerStyle]}>
        <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>🎉</Animated.Text>
        <Text style={Typography.heading}>Amazing!</Text>
        <Animated.View style={[styles.bonusContainer, animatedBonusStyle]}>
          <Text style={Typography.body}>+{bonusCoins} completion</Text>
          {noHintBonus > 0 && (
            <Text style={Typography.coin}>+{noHintBonus} no hints!</Text>
          )}
          {comboBonus > 0 && (
            <Text style={Typography.coin}>+{comboBonus} combos!</Text>
          )}
          <Text style={[Typography.subheading, styles.totalText]}>Total: +{totalBonus} 💎</Text>
        </Animated.View>
        <View style={styles.nextHint}>
          <Text style={Typography.small}>Next puzzle loading...</Text>
        </View>
      </Animated.View>
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
  bonusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  totalText: {
    color: colors.coinGold,
    marginTop: 12,
  },
  nextHint: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
});

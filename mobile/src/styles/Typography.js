// Typography.js - Unified typography system using Nunito font
// All text in the app MUST use these styles - no raw fontSize/fontFamily in screens

import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Typography scale: 5 sizes maximum
export const Typography = StyleSheet.create({
  // Heading - App title, major headings
  heading: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 48,
  },

  // Subheading - Section titles, button text
  subheading: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  // Body - Default text, word list
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  // Caption - Subtitles, secondary info
  caption: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Small - Helper text, stats
  small: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Variants for different contexts
  headingLight: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    color: colors.textLight,
    letterSpacing: -1,
    lineHeight: 48,
  },

  subheadingLight: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    color: colors.textLight,
    lineHeight: 24,
  },

  bodyLight: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },

  captionLight: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // Special styles
  button: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.textLight,
    letterSpacing: 1,
  },

  coin: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.coinGold,
  },

  streak: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.streakFire,
  },

  // Word definition styles
  wordTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },

  definition: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default Typography;
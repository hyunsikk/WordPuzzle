// Typography.js - Premium Scholar typography system using Nunito font
// All text in the app MUST use these styles - no raw fontSize/fontFamily in screens
// Emotional territory: CALM, INTELLIGENT, REWARDING

import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Typography scale: 5 sizes maximum - dramatic sizing for premium feel
export const Typography = StyleSheet.create({
  // Heading - App title, major headings (dramatic scale)
  heading: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 48, // Increased for premium presence
    color: colors.textPrimary,
    letterSpacing: -1.2, // More dramatic letter spacing
    lineHeight: 54,
  },

  // Subheading - Section titles, important elements
  subheading: {
    fontFamily: 'Nunito_700Bold', // Bolder for hierarchy
    fontSize: 22, // Slightly larger
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  // Body - Default text, comfortable reading
  body: {
    fontFamily: 'Nunito_500Medium', // Medium weight for better presence
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 25, // More generous line height
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

  // Light variants for dark backgrounds
  headingLight: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 48, // Match enhanced sizing
    color: colors.textLight,
    letterSpacing: -1.2,
    lineHeight: 54,
  },

  subheadingLight: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: colors.textLight,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  bodyLight: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 25,
  },

  captionLight: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: 'rgba(248, 246, 240, 0.8)', // Adjusted for warm ivory
    lineHeight: 20,
  },

  // Special styles - premium feel
  button: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.buttonText,
    letterSpacing: 0.5, // Refined letter spacing
    textTransform: 'uppercase',
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

  // Word of the Day - HUGE and dramatic (36-42pt as specified)
  wordOfTheDay: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 40, // Large as specified
    color: colors.textPrimary,
    letterSpacing: -0.8, // Subtle letter spacing
    lineHeight: 44,
  },

  // Enhanced word definition styles
  wordTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20, // Larger for prominence
    color: colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 24,
  },

  definition: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23, // More generous
    fontStyle: 'italic',
  },

  // Score display - premium emphasis
  scoreValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    color: colors.accent, // Gold accent
    letterSpacing: -0.5,
    lineHeight: 46,
  },

  // Grid letters - bold, clear, premium
  gridLetter: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
});

export default Typography;
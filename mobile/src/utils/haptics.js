// haptics.js - Haptic feedback utility using expo-haptics
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Light haptic for button presses and selections
export const lightImpact = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// Medium haptic for confirmations and interactions
export const mediumImpact = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

// Heavy haptic for major actions
export const heavyImpact = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

// Success feedback for positive actions (word found, puzzle completed)
export const successFeedback = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

// Warning feedback for negative actions or mistakes
export const warningFeedback = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

// Error feedback for errors
export const errorFeedback = () => {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

// Selection changed feedback for UI navigation
export const selectionChanged = () => {
  if (Platform.OS === 'ios') {
    Haptics.selectionAsync();
  }
};

export default {
  lightImpact,
  mediumImpact,
  heavyImpact,
  successFeedback,
  warningFeedback,
  errorFeedback,
  selectionChanged,
};
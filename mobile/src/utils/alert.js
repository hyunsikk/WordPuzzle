import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on both native and web.
 */
export const crossAlert = (title, message, buttons) => {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  if (!buttons || buttons.length === 0) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  if (buttons.length === 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    buttons[0].onPress?.();
    return;
  }

  const cancelButton = buttons.find(b => b.style === 'cancel');
  const actionButton = buttons.find(b => b.style !== 'cancel') || buttons[1];

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
  if (confirmed) {
    actionButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
};

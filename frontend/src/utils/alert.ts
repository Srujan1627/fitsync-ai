import { Alert, Platform } from 'react-native';

export const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    // Temporarily log to console instead of blocking the browser agent with a modal popup
    console.log(`ALERT: ${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

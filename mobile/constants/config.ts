import { Platform } from 'react-native';

// iOS simulator uses localhost, Android emulator uses 10.0.2.2
export const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3000/api',
      android: 'http://10.0.2.2:3000/api',
      default: 'http://localhost:3000/api',
    })
  : 'https://trading.champi.lat/api';

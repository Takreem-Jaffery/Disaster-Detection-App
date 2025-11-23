import axios from 'axios';
import { Platform } from 'react-native';

// Pick base URL depending on platform/environment
const BASE_URL = (() => {
  // Android phone - use your laptop's IP
  if (Platform.OS === 'android') return 'http://192.168.18.20:3000/api';
  // iOS simulator - use your laptop's IP
  if (Platform.OS === 'ios') return 'http://192.168.18.20:3000/api';
  // Web
  return 'http://192.168.18.20:3000/api';
})();

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default API;
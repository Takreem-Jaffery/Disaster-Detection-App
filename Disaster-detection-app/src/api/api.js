import axios from 'axios';
import { Platform } from 'react-native';

// Pick base URL depending on platform/environment
const BASE_URL = (() => {
  // Android emulator (AVD)
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  // iOS simulator (or expo web)
  return 'http://localhost:5000/api';
})();

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default API;

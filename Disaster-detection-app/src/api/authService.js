import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

export const setAuthToken = token => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export const saveToken = async token => {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  }
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  setAuthToken(null);
};

export const getStoredToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

// API calls
export const registerAPI = async ({ name, email, password, confirmPassword, role = 'user' }) => {
  return API.post('/auth/register', { name, email, password, confirmPassword, role });
};

export const loginAPI = async ({ email, password }) => {
  return API.post('/auth/login', { email, password });
};


// services/precautionService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const API_URL = 'http://192.168.100.10:3000/api/precautions';

// Get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create precaution
export const createPrecaution = async (precautionData) => {
  try {
    const token = await getAuthToken();
    console.log('Token before request:', token);
    const response = await axios.post(
      `${API_URL}/add`,
      {
        disasterType: precautionData.disasterType.toLowerCase(),
        severity: precautionData.severity.toLowerCase(),
        title: precautionData.title,
        precautions: precautionData.precautionText,
        isActive: precautionData.isActive,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating precaution:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create precaution',
    };
  }
};

// Get all precautions with optional filters
export const getPrecautions = async (filters = {}) => {
  try {
    const token = await getAuthToken();
    const params = {};
    
    if (filters.disasterType) {
      params.disasterType = filters.disasterType.toLowerCase();
    }
    if (filters.severity) {
      params.severity = filters.severity.toLowerCase();
    }
    if (filters.isActive !== undefined) {
      params.isActive = filters.isActive;
    }

    const response = await axios.get(`${API_URL}/view`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching precautions:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch precautions',
    };
  }
};

// Update precaution 
export const updatePrecaution = async (id, precautionData) => {
  try {
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_URL}/update/${id}`,
      {
        disasterType: precautionData.disasterType.toLowerCase(),
        severity: precautionData.severity.toLowerCase(),
        title: precautionData.title,
        precautions: precautionData.precautionText,
        isActive: precautionData.isActive,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating precaution:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update precaution',
    };
  }
};

// Delete precaution 
export const deletePrecaution = async (id) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(`${API_URL}/delete/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting precaution:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete precaution',
    };
  }
};
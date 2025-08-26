import api from '../services/api.js';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/health');
    console.log('Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || 'Network error'
    };
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('Testing auth endpoint...');
    const response = await api.get('/auth/me');
    console.log('Auth endpoint successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Auth endpoint failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || 'Network error'
    };
  }
};
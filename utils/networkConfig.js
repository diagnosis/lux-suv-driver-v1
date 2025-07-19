import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Network configuration for different environments
export const getApiBaseUrl = () => {
  // Always use production URL since we're connecting to external API
  return 'https://luxsuv-v4.onrender.com';
};

// Debug network information
export const getNetworkInfo = () => {
  const info = {
    platform: Platform.OS,
    isDevice: Constants.isDevice,
    expoVersion: Constants.expoVersion,
    apiUrl: getApiBaseUrl(),
  };
  
  console.log('Network Info:', info);
  return info;
};

// Test network connectivity
export const testNetworkConnectivity = async () => {
  try {
    console.log('Testing connectivity to:', `${getApiBaseUrl()}/health`);
    
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Health check response status:', response.status);
    const responseText = await response.text();
    console.log('Health check response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Network connectivity test passed');
      return true;
    } else {
      console.log('❌ Network connectivity test failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Network connectivity test error:', error.message);
    console.log('Full error details:', error);
    return false;
  }
};
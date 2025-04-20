import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_GATEWAY_ORIGIN
});

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    // Check if the expiration time (exp) is in the past
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, assume it's expired
    console.error('Error decoding token:', error);
    return true;
  }
};

// Get Cognito login URL
const getCognitoLoginUrl = () => {
  const domain = process.env.REACT_APP_COGNITO_DOMAIN;
  const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    process.env.REACT_APP_COGNITO_LOGIN_REDIRECT_URI || 
    window.location.origin + '/callback'
  );
  const responseType = 'token';
  const scope = 'email+openid+phone';

  return `https://${domain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
};

// Add a request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('id_token');
    
    // If token exists, check if it's expired before using it
    if (token) {
      // Check token expiration
      if (isTokenExpired(token)) {
        console.log('Token expired before request, redirecting to login');
        // Clear token from storage
        localStorage.removeItem('id_token');
        localStorage.removeItem('access_token');
        
        // Redirect to login
        window.location.href = getCognitoLoginUrl();
        
        // Reject the request
        return Promise.reject(new Error('Token expired'));
      }
      
      // Token is valid, add to headers
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle auth-related errors (401, 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token might be invalid or expired according to the server
      console.log('Server rejected token (401/403), redirecting to login');
      
      // Clear tokens from storage
      localStorage.removeItem('id_token');
      localStorage.removeItem('access_token');
      
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/callback') {
        localStorage.setItem('auth_redirect_url', currentPath);
      }
      
      // Redirect to login
      window.location.href = getCognitoLoginUrl();
      
      // Return an empty promise to prevent further error handling
      return new Promise(() => {});
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
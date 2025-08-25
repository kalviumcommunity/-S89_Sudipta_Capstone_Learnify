import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Request caching and deduplication
  const requestCacheRef = useRef(new Map());
  const pendingRequestsRef = useRef(new Map());

  // Configure axios defaults
  // Using relative URLs since we have proxy configured in vite.config.js
  axios.defaults.baseURL = '/api';
  axios.defaults.withCredentials = true;

  // Set up axios interceptor to include JWT token in requests
  useEffect(() => {
    const token = localStorage.getItem('learnify_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Request interceptor to add token to all requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('learnify_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('learnify_token');
          localStorage.removeItem('learnify_user');
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for OAuth errors in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const oauthError = urlParams.get('error');

      if (oauthError) {
        console.error('OAuth error:', oauthError);
        let errorMessage = 'Authentication failed. Please try again.';

        switch(oauthError) {
          case 'oauth_failed':
            errorMessage = 'Google authentication failed. Please try again.';
            break;
          case 'oauth_error':
            errorMessage = 'An error occurred during authentication. Please try again.';
            break;
          default:
            errorMessage = 'Authentication failed. Please try again.';
        }

        // Show error message to user (you can implement a toast notification here)
        console.error('OAuth Error:', errorMessage);

        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Check if we're on the dashboard page with a token from Google OAuth
      if (window.location.pathname === '/dashboard') {
        const tokenFromUrl = urlParams.get('token');
        console.log('Dashboard page detected, token from URL:', tokenFromUrl ? 'present' : 'not found');

        if (tokenFromUrl) {
          console.log('Processing OAuth token...');
          // Store the token and get user info
          localStorage.setItem('learnify_token', tokenFromUrl);
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;

          try {
            // Get user info using the token
            const response = await axios.get('/auth/me');
            if (response.data.user) {
              const userData = response.data.user;
              console.log('OAuth login successful for user:', userData.email);
              setUser(userData);
              setIsAuthenticated(true);
              localStorage.setItem('learnify_user', JSON.stringify(userData));

              // Clean up the URL by removing the token parameter
              window.history.replaceState({}, document.title, '/dashboard');
              return;
            }
          } catch (err) {
            console.error('Error getting user info with token:', err);
            localStorage.removeItem('learnify_token');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }

      // Check if token exists in localStorage
      const token = localStorage.getItem('learnify_token');
      const savedUser = localStorage.getItem('learnify_user');

      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
      } else {
        // Check if we're on the dashboard page (might be coming from Google OAuth without token)
        if (window.location.pathname === '/dashboard') {
          // Try to get user info from the server session
          try {
            const response = await axios.get('/auth/me');
            if (response.data.user) {
              const userData = response.data.user;
              setUser(userData);
              setIsAuthenticated(true);
              localStorage.setItem('learnify_user', JSON.stringify(userData));
            }
          } catch (err) {
            // If no session, redirect to sign in
            console.log('No active session found');
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('learnify_user');
      localStorage.removeItem('learnify_token');
    } finally {
      setLoading(false);
    }
  };

  // Login function
const login = async (email, password) => {
    setLoading(true); // Add loading state
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      if (response.data.success && response.data.data && response.data.data.user && response.data.data.token) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        setUser(userData);
        setIsAuthenticated(true);

        // Save user data and token to localStorage
        localStorage.setItem('learnify_user', JSON.stringify(userData));
        localStorage.setItem('learnify_token', token);

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Login failed - invalid response format'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg || error.response.data.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true); // Add loading state
    try {
      const response = await axios.post('/auth/register', {
        name,
        email,
        password
      });

      if (response.data.success && response.data.data && response.data.data.user && response.data.data.token) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        setUser(userData);
        setIsAuthenticated(true);

        // Save user data and token to localStorage
        localStorage.setItem('learnify_user', JSON.stringify(userData));
        localStorage.setItem('learnify_token', token);

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration failed - invalid response format'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg || error.response.data.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('learnify_user');
    localStorage.removeItem('learnify_token');

    // Remove token from axios headers
    delete axios.defaults.headers.common['Authorization'];

    // Optional: Call backend logout endpoint
    // axios.post('/auth/logout').catch(console.error);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('learnify_user', JSON.stringify(userData));
  };

  // Google OAuth login
  const loginWithGoogle = () => {
    console.log('Initiating Google OAuth...');
    // Use relative URL to work with proxy configuration
    window.location.href = `/api/auth/google`;
  };

  // Helper function for cached requests with deduplication
  const cachedRequest = async (url, options = {}) => {
    const cacheKey = `${url}?${JSON.stringify(options)}`;
    const now = Date.now();
    const cacheTimeout = 30000; // 30 seconds cache

    // Check if we have a cached result that's still valid
    const cached = requestCacheRef.current.get(cacheKey);
    if (cached && (now - cached.timestamp) < cacheTimeout) {
      console.log(`Using cached data for ${url}`);
      return cached.data;
    }

    // Check if there's already a pending request for this URL
    if (pendingRequestsRef.current.has(cacheKey)) {
      console.log(`Waiting for pending request for ${url}`);
      return pendingRequestsRef.current.get(cacheKey);
    }

    // Make the request and cache the promise
    const requestPromise = axios.get(url, options).then(response => {
      // Cache the successful response
      requestCacheRef.current.set(cacheKey, {
        data: response.data,
        timestamp: now
      });

      // Remove from pending requests
      pendingRequestsRef.current.delete(cacheKey);

      return response.data;
    }).catch(error => {
      // Remove from pending requests on error
      pendingRequestsRef.current.delete(cacheKey);
      throw error;
    });

    // Store the promise in pending requests
    pendingRequestsRef.current.set(cacheKey, requestPromise);

    return requestPromise;
  };

  // Dashboard API functions
  const dashboardAPI = {
    // Get user dashboard statistics
    getStats: async () => {
      if (!user?._id) throw new Error('User not authenticated');

      try {
        return await cachedRequest('/dashboard/stats');
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },

    // Get test history
    getTestHistory: async (filters = {}) => {
      if (!user?._id) throw new Error('User not authenticated');

      try {
        const params = new URLSearchParams(filters);
        return await cachedRequest(`/dashboard/test-history?${params.toString()}`);
      } catch (error) {
        console.error('Error fetching test history:', error);
        throw error;
      }
    },

    // Get calendar data
    getCalendarData: async (filters = {}) => {
      if (!user?._id) throw new Error('User not authenticated');

      try {
        const params = new URLSearchParams(filters);
        return await cachedRequest(`/dashboard/calendar?${params.toString()}`);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        throw error;
      }
    },

    // Submit test result
    submitTestResult: async (testResultData) => {
      if (!user?._id) throw new Error('User not authenticated');

      try {
        console.log('Submitting test result:', testResultData);
        const response = await axios.post('/dashboard/submit-test-result', testResultData);

        // Clear cache since data has changed
        requestCacheRef.current.clear();
        pendingRequestsRef.current.clear();

        // Trigger a dashboard data refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('dashboardDataUpdate'));

        return response.data;
      } catch (error) {
        console.error('Error submitting test result:', error);
        throw error;
      }
    },

    // Record activity
    recordActivity: async (activityType, details, date) => {
      if (!user?._id) throw new Error('User not authenticated');

      try {
        const response = await axios.post('/dashboard/record-activity', {
          activityType,
          details,
          date
        });
        return response.data;
      } catch (error) {
        console.error('Error recording activity:', error);
        throw error;
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    loginWithGoogle,
    dashboardAPI
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

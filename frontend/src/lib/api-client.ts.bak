import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request-Interceptor für JWT-Token
apiClient.interceptors.request.use(
  (config) => {
    // Hole Token aus Zustand persist storage
    const storedAuth = localStorage.getItem('aurora-auth-storage');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        const token = parsedAuth.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response-Interceptor für Error-Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lösche gesamten Auth-State bei 401
      localStorage.removeItem('aurora-auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
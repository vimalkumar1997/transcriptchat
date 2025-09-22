import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

interface ApiResponse<T = any> {
    data: T;
    message: string;
    status: string;
}

interface TokenPayload {
    userId: number;
    username: string;
    iat: number;
    exp: number;
}

interface DecodedToken {
    payload: TokenPayload;
    isValid: boolean;
    isExpired: boolean;
}

export const endpoints = {
    auth: {
        login: "/login",
        register: "/register",
        resetPassword: "/reset-password",
        verifyToken: "/verify-token",
        refreshToken: "/refresh-token",
    },
    health: "/health",
};

// Token utility functions
export const TokenUtils = {
    // Store token in localStorage
    setToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    },

    // Get token from localStorage
    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    // Remove token from localStorage
    removeToken: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    },

    // Decode JWT token (client-side basic decoding)
    decodeToken: (token: string): DecodedToken => {
        try {
            if (!token) {
                return { payload: {} as TokenPayload, isValid: false, isExpired: true };
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                return { payload: {} as TokenPayload, isValid: false, isExpired: true };
            }

            const payload = JSON.parse(atob(parts[1])) as TokenPayload;
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;
            const isValid = !isExpired && payload.userId && payload.username;

            return {
                payload,
                isValid: !!isValid,
                isExpired
            };
        } catch (error) {
            console.error('Token decode error:', error);
            return { payload: {} as TokenPayload, isValid: false, isExpired: true };
        }
    },

    // Check if token is valid and not expired
    isTokenValid: (): boolean => {
        const token = TokenUtils.getToken();
        if (!token) return false;

        const decoded = TokenUtils.decodeToken(token);
        return decoded.isValid && !decoded.isExpired;
    },

    // Get token expiry time
    getTokenExpiry: (): Date | null => {
        const token = TokenUtils.getToken();
        if (!token) return null;

        const decoded = TokenUtils.decodeToken(token);
        if (!decoded.isValid) return null;

        return new Date(decoded.payload.exp * 1000);
    },

    // Get user info from token
    getUserFromToken: (): { userId: number; username: string } | null => {
        const token = TokenUtils.getToken();
        if (!token) return null;

        const decoded = TokenUtils.decodeToken(token);
        if (!decoded.isValid) return null;

        return {
            userId: decoded.payload.userId,
            username: decoded.payload.username
        };
    },

    // Auto-refresh token before expiry (call this periodically)
    scheduleTokenRefresh: (callback?: () => void): NodeJS.Timeout | null => {
        const token = TokenUtils.getToken();
        if (!token) return null;

        const decoded = TokenUtils.decodeToken(token);
        if (!decoded.isValid) return null;

        const expiryTime = decoded.payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        // Refresh 5 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

        if (refreshTime > 0) {
            return setTimeout(async () => {
                try {
                    await StarReportAPI.verifyToken();
                    if (callback) callback();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    TokenUtils.removeToken();
                }
            }, refreshTime);
        }

        return null;
    }
};

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    timeout: 150000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TokenUtils.getToken();
        
        // Only add token if it's valid
        if (token && TokenUtils.isTokenValid()) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (token) {
            // Remove invalid token
            TokenUtils.removeToken();
            console.warn('Invalid or expired token removed');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh or logout
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Try to verify/refresh token first
            try {
                const token = TokenUtils.getToken();
                if (token) {
                    await StarReportAPI.verifyToken();
                    // Retry original request with new token
                    const newToken = TokenUtils.getToken();
                    if (newToken && originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, remove token and redirect to login
                TokenUtils.removeToken();
                
                // Dispatch logout event or redirect to login
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('token-expired'));
                    // You can also redirect directly: window.location.href = '/login';
                }
                
                return Promise.reject(error);
            }
        }
        
        // For other 401 errors or if retry failed
        if (error.response?.status === 401) {
            TokenUtils.removeToken();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('token-expired'));
            }
        }
        
        return Promise.reject(error);
    }
);

const handleApiError = (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
            case 400:
                console.error("Bad Request:", error.response.data);
                break;
            case 401:
                console.error("Unauthorized:", error.response.data);
                break;
            case 403:
                console.error("Forbidden:", error.response.data);
                break;
            case 404:
                console.error("Not Found:", error.response.data);
                break;
            case 500:
                console.error("Internal Server Error:", error.response.data);
                break;
            default:
                console.error("An unexpected error occurred:", error.message);
        }
    } else {
        console.error("An unknown error occurred:", error);
    }
};

export const StarReportAPI = {
    // GET request
    get: async <T = any>(
        endpoint: string,
        params: Record<string, any> = {},
    ): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError);
            throw error;
        }
    },

    // POST request
    post: async <T = any>(
        endpoint: string,
        data: Record<string, any> = {},
        config: Record<string, any> = {}
    ): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError);
            throw error;
        }
    },

    // PUT request
    put: async <T = any>(
        endpoint: string,
        data: Record<string, any> = {},
        config: Record<string, any> = {}
    ): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await apiClient.put(endpoint, data, config);
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError);
            throw error;
        }
    },

    // PATCH request
    patch: async <T = any>(
        endpoint: string,
        data: Record<string, any> = {},
        config: Record<string, any> = {}
    ): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await apiClient.patch(endpoint, data, config);
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError);
            throw error;
        }
    },

    // DELETE request
    delete: async <T = any>(
        endpoint: string,
        params: Record<string, any> = {}
    ): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await apiClient.delete(endpoint, { params });
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError);
            throw error;
        }
    },

    // Auth specific methods
    login: async (credentials: { email: string; password: string }) => {
        const response = await StarReportAPI.post(endpoints.auth.login, credentials);
        if (response.token) {
            TokenUtils.setToken(response.token);
        }
        
        return response;
    },

    register: async (userData: { username: string; email: string; password: string }) => {
        return StarReportAPI.post(endpoints.auth.register, userData);
    },

    resetPassword: async (resetData: { email: string; password: string; confirmPassword: string }) => {
        return StarReportAPI.post(endpoints.auth.resetPassword, resetData);
    },

    // Verify token with backend
    verifyToken: async (): Promise<{ valid: boolean; user?: any }> => {
        const token = TokenUtils.getToken();
        if (!token) {
            throw new Error('No token found');
        }

        // First check client-side validation
        if (!TokenUtils.isTokenValid()) {
            TokenUtils.removeToken();
            throw new Error('Token expired or invalid');
        }

        try {
            // Verify with backend
            const response = await StarReportAPI.post(endpoints.auth.verifyToken, { token });
            return response;
        } catch (error) {
            TokenUtils.removeToken();
            throw error;
        }
    },

    // Refresh token
    refreshToken: async (): Promise<{ token: string }> => {
        const currentToken = TokenUtils.getToken();
        if (!currentToken) {
            throw new Error('No token to refresh');
        }

        try {
            const response = await StarReportAPI.post(endpoints.auth.refreshToken, { token: currentToken });
            
            if (response.token) {
                TokenUtils.setToken(response.token);
            }
            
            return response;
        } catch (error) {
            TokenUtils.removeToken();
            throw error;
        }
    },

    // Logout - remove token and optionally call backend
    logout: async (callBackend: boolean = false): Promise<void> => {
        if (callBackend) {
            try {
                await StarReportAPI.post('/logout');
            } catch (error) {
                console.warn('Backend logout failed:', error);
            }
        }
        
        TokenUtils.removeToken();
        
        // Dispatch logout event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('user-logged-out'));
        }
    },

    // Check authentication status
    isAuthenticated: (): boolean => {
        return TokenUtils.isTokenValid();
    },

    // Get current user info
    getCurrentUser: () => {
        return TokenUtils.getUserFromToken();
    },

    healthCheck: async () => {
        return StarReportAPI.get(endpoints.health);
    },
};

export default StarReportAPI;
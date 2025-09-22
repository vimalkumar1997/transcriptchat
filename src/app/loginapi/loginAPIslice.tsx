import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import StarReportAPI, { TokenUtils } from "./startReportApi";

// Define types for API responses
interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

interface RegisterResponse {
    message: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

interface ResetPasswordResponse {
    message: string;
}

interface VerifyTokenResponse {
    valid: boolean;
    user: {
        id: number;
        username: string;
        email: string;
    };
    message: string;
}

interface RefreshTokenResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    message: string;
}

interface HealthResponse {
    status: string;
    timestamp: string;
    uptime: number;
}

interface UserProfileResponse {
    user: {
        id: number;
        username: string;
        email: string;
        created_at: string;
    };
}

interface ApiError {
    status: number;
    data: {
        error: string;
    };
}

// Custom base query function using StarReportAPI
const starReportBaseQuery: BaseQueryFn<
    {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        data?: Record<string, any>;
        params?: Record<string, any>;
    },
    unknown,
    ApiError
> = async ({ url, method, data, params }) => {
    try {
        let result;
        
        switch (method) {
            case 'GET':
                result = await StarReportAPI.get(url, params);
                break;
            case 'POST':
                result = await StarReportAPI.post(url, data);
                break;
            case 'PUT':
                result = await StarReportAPI.put(url, data);
                break;
            case 'PATCH':
                result = await StarReportAPI.patch(url, data);
                break;
            case 'DELETE':
                result = await StarReportAPI.delete(url, params);
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
        
        return { data: result };
    } catch (error: any) {
        return {
            error: {
                status: error.response?.status || 500,
                data: error.response?.data || { error: error.message || 'An error occurred' }
            }
        };
    }
};

// Create the API slice
export const loginAPISlice = createApi({
    reducerPath: 'authApi',
    baseQuery: starReportBaseQuery,
    tagTypes: ['Auth', 'User', 'Health', 'Profile'],
    endpoints: (builder) => ({
        // Login mutation
        login: builder.mutation<LoginResponse, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                data: credentials,
            }),
            invalidatesTags: ['Auth', 'User'],
            transformResponse: (response: LoginResponse) => {
                // Auto-store token when login is successful
                if (response.token) {
                    TokenUtils.setToken(response.token);
                }
                return response;
            },
        }),

        // Register mutation
        register: builder.mutation<RegisterResponse, { username: string; email: string; password: string }>({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                data: userData,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Reset password mutation
        resetPassword: builder.mutation<ResetPasswordResponse, { email: string; password: string; confirmPassword: string }>({
            query: (resetData) => ({
                url: '/reset-password',
                method: 'POST',
                data: resetData,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Verify token mutation
        verifyToken: builder.mutation<VerifyTokenResponse, { token: string }>({
            query: (tokenData) => ({
                url: '/verify-token',
                method: 'POST',
                data: tokenData,
            }),
            providesTags: ['Auth'],
        }),

        // Refresh token mutation
        refreshToken: builder.mutation<RefreshTokenResponse, { token: string }>({
            query: (tokenData) => ({
                url: '/refresh-token',
                method: 'POST',
                data: tokenData,
            }),
            invalidatesTags: ['Auth', 'User'],
            transformResponse: (response: RefreshTokenResponse) => {
                // Auto-store new token when refresh is successful
                if (response.token) {
                    TokenUtils.setToken(response.token);
                }
                return response;
            },
        }),

        // Logout mutation
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User', 'Profile'],
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } finally {
                    // Always remove token on logout, even if backend call fails
                    TokenUtils.removeToken();
                }
            },
        }),
        // Token management endpoints
        checkAuthStatus: builder.query<{ isAuthenticated: boolean; user: any | null }, void>({
            queryFn: async () => {
                try {
                    const isValid = TokenUtils.isTokenValid();
                    const user = TokenUtils.getUserFromToken();
                    
                    if (isValid && user) {
                        // Verify with backend
                        const token = TokenUtils.getToken();
                        if (token) {
                            await StarReportAPI.verifyToken();
                            return { 
                                data: { 
                                    isAuthenticated: true, 
                                    user 
                                } 
                            };
                        }
                    }
                    
                    return { 
                        data: { 
                            isAuthenticated: false, 
                            user: null 
                        } 
                    };
                } catch (error: any) {
                    TokenUtils.removeToken();
                    return { 
                        data: { 
                            isAuthenticated: false, 
                            user: null 
                        } 
                    };
                }
            },
            providesTags: ['Auth'],
        }),
    }),
});
export const {
    useLoginMutation,
    useRegisterMutation,
    useResetPasswordMutation,
    useVerifyTokenMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
} = loginAPISlice;

export default loginAPISlice;
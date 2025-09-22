import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, LoadingOverlay } from '@mantine/core';
import DarkLightTheme from './DarkLightTheme';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/signup', '/forgotpassword'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Optional: Verify token validity here
          // You can add token expiration check or API call to validate
          setIsAuthenticated(true);
          
          // If user is authenticated and on a public route, redirect to dashboard/home
          if (isPublicRoute && router.pathname === '/') {
            router.push('/transcript'); // or your main authenticated page
          }
        } else {
          setIsAuthenticated(false);
          
          // If user is not authenticated and trying to access protfected route
          if (!isPublicRoute) {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (!isPublicRoute) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only run auth check after router is ready
    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady, router.pathname, isPublicRoute]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible overlayProps={{ radius: "sm", blur: 2 }} />
      </Box>
    );
  }

  // For public routes, always render children
  if (isPublicRoute) {
    return (
      <Box>
        <DarkLightTheme />
        {children}
      </Box>
    );
  }

  // For protected routes, only render if authenticated
  if (isAuthenticated) {
    return (
      <Box>
        <DarkLightTheme />
        {children}
      </Box>
    );
  }

  // If not authenticated and not on public route, show nothing (redirect will handle it)
  return null;
}
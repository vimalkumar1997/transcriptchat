import { useState, useEffect } from "react";
import { Box, Typography } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Card, 
  Anchor, 
  Alert,
  LoadingOverlay,
  Group,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useLoginMutation } from '@/app/loginapi/loginAPIslice'; // Update with your actual path
import { TokenUtils } from '@/app/loginapi/startReportApi'; // Update with your actual path

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (TokenUtils.isTokenValid()) {
      router.push('/transcript'); // Redirect to dashboard or home page
    }
  }, [router]);

  // Form validation using Mantine form
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
    },
  });

  // Handle form submission
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      // Show success notification
      notifications.show({
        title: 'Login Successful',
        message: `Welcome back, ${result.user?.username || 'User'}!`,
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      });

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Redirect to dashboard or intended page
      const redirectUrl = router.query.redirect as string || '/transcript';
      router.push(redirectUrl);

    } catch (error: any) {
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error notification
      notifications.show({
        title: 'Login Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
        autoClose: 5000,
      });

      // Clear password field on error
      form.setFieldValue('password', '');
    }
  };

  // Handle "Remember Me" functionality
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('savedEmail');
    
    if (savedRememberMe === 'true' && savedEmail) {
      form.setFieldValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [form]);

  // Save email when remember me is checked
  useEffect(() => {
    if (rememberMe && form.values.email) {
      localStorage.setItem('savedEmail', form.values.email);
    } else {
      localStorage.removeItem('savedEmail');
    }
  }, [rememberMe, form.values.email]);

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      form.onSubmit(handleSubmit)();
    }
  };

  function hadleSignupRedirect(){
    router.push('/signup');
  }

  return (
    <>
      <Head>
        <title>Transcript Converter Chat - Login</title>
        <meta name="description" content="Login to your Transcript Converter Chat account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div>
        <Box h={"100vh"} display={"flex"} className={styles.loginMain}>
          <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder 
            w={"500px"}
            style={{ position: 'relative' }}
          >
            <LoadingOverlay visible={isLoading}  />
            
            <Typography variant={"h4"} component={"h4"} ta="center" mb="xs">
              Welcome Back
            </Typography>
            <Typography variant={"h2"} component={"h2"} ta="center" mb="xl">
              Login to continue
            </Typography>

            {/* Show error alert if there's an API error */}
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Login Error"
                color="red"
                mb="md"
              >
                {(error as any)?.data?.error || 'An unexpected error occurred'}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)} onKeyPress={handleKeyPress}>
              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                m="xs"
                size="md"
                required
                type="email"
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email}
                disabled={isLoading}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                m="xs"
                size="md"
                required
                value={form.values.password}
                onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                error={form.errors.password}
                disabled={isLoading}
                visible={showPassword}
                onVisibilityChange={setShowPassword}
              />

              <Group  mt="xs" mb="md">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <Text size="sm">Remember me</Text>
                </label>
                <Box style={{ flexGrow: 1 }} />
                <Anchor 
                  // href="/forgotpassword" 
                  ta="right" 
                  c="#3F3EED !important"
                  size="sm"
                  onClick={() => router.push('/forgotpassword')}
                >
                  Forgot password?
                </Anchor>
              </Group>

              <Button 
                fullWidth 
                mt="xl" 
                size="md"
                type="submit"
                loading={isLoading}
                disabled={!form.isValid()}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Typography variant={"body1"} component={"p"} ta="center" mt="md">
              Don't have an account?
              <Anchor 
                // href="/signup" 
                ta="right" 
                c="#3F3EED !important" 
                mt="xs" 
                ml={"xs"}
                onClick={hadleSignupRedirect}
              >
                Sign Up for free
              </Anchor>
            </Typography>

            {/* Additional login options */}
            <Box mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
              <Typography variant={"body2"} component={"p"} ta="center" c="dimmed">
                Secure login with end-to-end encryption
              </Typography>
            </Box>
          </Card>
        </Box>
      </div>
    </>
  );
}

// Optional: Add a higher-order component for route protection
export const withAuthRedirect = (WrappedComponent: React.ComponentType) => {
  return function AuthRedirectComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      // If user is already logged in, redirect to dashboard
      if (TokenUtils.isTokenValid()) {
        router.push('/transcript');
      }
    }, [router]);

    // Don't render the login page if user is already authenticated
    if (TokenUtils.isTokenValid()) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};
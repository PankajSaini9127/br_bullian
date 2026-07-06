import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Link,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { gradients } from '../theme';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { modeColors: mc, mode } = useThemeMode();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const userData = {
      username: formData.username,
      password: formData.password,
    };

    const toastId = toast.loading('Logging in...');
    const result = await login(userData);
    setLoading(false);

    if (result.success) {
      toast.dismiss(toastId);
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.dismiss(toastId);
      toast.error('Login failed');
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: { xs: 3, sm: 4 },
          background: mode === 'dark' ? '#0a0a12' : gradients.loginPage,
          ...(mode === 'dark' && {
            backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
          }),
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 2.5, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            width: '100%',
            maxWidth: 440,
            background: mode === 'dark' ? 'rgba(20, 20, 32, 0.72)' : mc.background.cardGradient,
            backdropFilter: mode === 'dark' ? 'blur(16px)' : 'none',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : `2px solid ${mc.border}`,
            boxShadow: mode === 'dark' ? '0 16px 48px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Avatar sx={{ m: 1, width: 56, height: 56, bgcolor: gradients.primary, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)', border: mode === 'dark' ? '2px solid rgba(255,255,255,0.1)' : '3px solid #fff' }}>
              <LockOutlinedIcon sx={{ color: '#ffffff', fontSize: 28 }} />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 1, mb: 0.5, fontWeight: 700, letterSpacing: 0.5, background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
              Welcome to BR Bullion
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                Login successful! Welcome back.
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: '100%' }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#818cf8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#818cf8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: 2,
                    },
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                          aria-label="toggle password visibility"
                          size="large"
                          sx={{ 
                            color: '#6366f1',
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 28 }} /> : <Visibility sx={{ fontSize: 28 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2, 
                  mb: 1, 
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  background: gradients.primary,
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: gradients.primaryHover,
                    boxShadow: '0 12px 28px rgba(99, 102, 241, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Divider sx={{ my: 1.5, borderColor: 'divider', borderWidth: 1 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Link href="#" variant="body2" sx={{ color: '#6366f1', fontWeight: 600, '&:hover': { color: '#ec4899' } }}>
                  Forgot password?
                </Link>
              </Box>
            </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: { xs: 2, sm: 3 } }}>
            {'Copyright © '}
            <Link color="inherit" href="#">
              BR Bullion
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
  );
};

export default Login;

import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login/', { email, password });
  return response.data;
};

export const register = async (first_name, last_name, email, password) => {
  const response = await api.post('/api/auth/register/', {
    first_name,
    last_name,
    email,
    password,
  });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/api/auth/verify-email/${token}/`);
  return response.data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post('/api/auth/resend-verification-email/', { email });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me/');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgot-password/', { email });
  return response.data;
};

export const resetPassword = async (token, new_password) => {
  const response = await api.post(`/api/auth/reset-password/${token}/`, { new_password });
  return response.data;
};

export const changePassword = async (current_password, new_password) => {
  const response = await api.post('/api/auth/change-password/', {
    current_password,
    new_password,
  });
  return response.data;
};

export const updateProfile = async (first_name, last_name) => {
  const response = await api.put('/api/auth/profile/update/', {
    first_name,
    last_name,
  });
  return response.data;
};

export const logout = async (refresh_token) => {
  const response = await api.post('/api/auth/logout/', { refresh_token });
  return response.data;
};

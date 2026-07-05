import api from './api';

export const getCreditBalance = async () => {
  try {
    const res = await api.get('/api/v1/payments/credits/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load credits.' };
  }
};

export const getCreditTransactions = async () => {
  try {
    const res = await api.get('/api/v1/payments/transactions/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load transaction history.' };
  }
};

export const createPaymentOrder = async (amount, creditsPurchased) => {
  try {
    const res = await api.post('/api/v1/payments/create/', {
      amount,
      credits_purchased: creditsPurchased
    });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || 'Failed to create order.' };
  }
};

export const confirmPayment = async (paymentId) => {
  try {
    const res = await api.post(`/api/v1/payments/${paymentId}/confirm/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || 'Failed to confirm payment.' };
  }
};

export const generateAPIKey = async () => {
  try {
    const res = await api.post('/api/v1/payments/users/me/api-key/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to generate API key.' };
  }
};

export const revokeAPIKey = async () => {
  try {
    const res = await api.delete('/api/v1/payments/users/me/api-key/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to revoke API key.' };
  }
};

export const getAPIKey = async () => {
  try {
    const res = await api.get('/api/v1/payments/users/me/api-key/');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to load API key.' };
  }
};


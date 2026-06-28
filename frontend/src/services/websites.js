import api from './api';

export const createWebsite = async (domain) => {
  const response = await api.post('/api/v1/websites/', { domain });
  return response.data;
};

export const getAllWebsites = async () => {
  const response = await api.get('/api/v1/websites/get_all/');
  return response.data;
};

export const getWebsite = async (id) => {
  const response = await api.get(`/api/v1/websites/${id}/`);
  return response.data;
};

export const updateWebsite = async (id, domain) => {
  const response = await api.put(`/api/v1/websites/${id}/update/`, { domain });
  return response.data;
};

export const deleteWebsite = async (id) => {
  const response = await api.delete(`/api/v1/websites/${id}/delete/`);
  return response.data;
};

export const getVerificationStatus = async (id) => {
  const response = await api.get(`/api/v1/websites/${id}/verification-status/`);
  return response.data;
};

export const verifyWebsite = async (id) => {
  const response = await api.post(`/api/v1/websites/${id}/verify/`);
  return response.data;
};

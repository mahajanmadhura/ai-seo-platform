import api from './api';

export const generateAIRecommendation = async (auditId, regenerate = false) => {
  try {
    const url = `/api/v1/ai-recommendations/audits/${auditId}/generate/${regenerate ? '?regenerate=true' : ''}`;
    const res = await api.post(url);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to generate AI recommendations.' };
  }
};

export const getAIRecommendation = async (auditId) => {
  try {
    const res = await api.get(`/api/v1/ai-recommendations/audits/${auditId}/`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.error || 'Failed to fetch AI recommendations.' };
  }
};

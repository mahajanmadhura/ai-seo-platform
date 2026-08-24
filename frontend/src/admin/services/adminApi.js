import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminApi = {
  // 1. Operations Center Dashboard Analytics
  getDashboardAnalytics: async () => {
    const res = await adminAxios.get('/api/v1/admin/dashboard/analytics/');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await adminAxios.get('/api/v1/admin/payments/analytics/');
    return res.data;
  },

  getRevenueOverview: async () => {
    const res = await adminAxios.get('/api/v1/admin/payments/revenue/');
    return res.data;
  },

  // 2. Process Health & Celery Queue
  getSystemProcesses: async () => {
    const res = await adminAxios.get('/api/v1/admin/system/processes/');
    return res.data;
  },

  getCrawlerQueue: async () => {
    const res = await adminAxios.get('/api/v1/admin/system/queue/');
    return res.data;
  },

  // 3. User Management & Customer Intelligence
  getUsers: async (page = 1) => {
    const res = await adminAxios.get(`/api/v1/admin/users/?page=${page}`);
    return res.data;
  },

  getUserDetailAnalytics: async (userId) => {
    const res = await adminAxios.get(`/api/v1/admin/users/${userId}/analytics/`);
    return res.data;
  },

  updateUserRole: async (userId, data) => {
    const res = await adminAxios.put(`/api/v1/admin/roles/${userId}/`, data);
    return res.data;
  },

  adjustUserCredits: async (userId, data) => {
    const res = await adminAxios.put(`/api/v1/admin/users/${userId}/credits/`, data);
    return res.data;
  },

  // 4. Websites Inspection
  getWebsites: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const res = await adminAxios.get(`/api/v1/admin/websites/?${queryParams}`);
    return res.data;
  },

  // 5. Audits Explorer
  getAudits: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const res = await adminAxios.get(`/api/v1/admin/audits/?${queryParams}`);
    return res.data;
  },

  // 6. AI Engine Telemetry & Groq Usage
  getGroqUsage: async () => {
    const res = await adminAxios.get('/api/v1/admin/ai/groq-usage/');
    return res.data;
  },

  getAiStats: async () => {
    const res = await adminAxios.get('/api/v1/admin/ai/stats/');
    return res.data;
  },

  // 7. System Error Logs
  getSystemLogs: async (page = 1) => {
    const res = await adminAxios.get(`/api/v1/admin/system/logs/?page=${page}`);
    return res.data;
  },

  // 8. Reports Center
  getReportsData: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const res = await adminAxios.get(`/api/v1/admin/reports/data/?${queryParams}`);
    return res.data;
  },

  downloadReportExport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const format = (params.format || 'pdf').toLowerCase();
    const reportType = params.report_type || 'revenue';
    
    let ext = 'pdf';
    let mimeType = 'application/pdf';

    if (format === 'json') {
      ext = 'json';
      mimeType = 'application/json;charset=utf-8;';
    } else if (format === 'excel' || format === 'xlsx') {
      ext = 'xlsx';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (format === 'csv') {
      ext = 'csv';
      mimeType = 'text/csv;charset=utf-8;';
    }

    const filename = `Athenura_${reportType.toLowerCase()}_report.${ext}`;

    const res = await adminAxios.get(`/api/v1/admin/reports/export/?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([res.data], { type: mimeType });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 300);
    }
  },
};

export default adminApi;

import api from './api';

/**
 * Helper to sanitize raw domain URLs into professional, user-friendly filenames.
 * Examples:
 * - https://www.github.com -> github_seo_report.pdf
 * - https://www.youtube.com -> youtube_seo_report.pdf
 * - https://lexify-app.vercel.app -> lexify-app_seo_report.pdf
 */
export const getCleanFilename = (websiteUrl, ext = 'pdf') => {
  if (!websiteUrl) return `seo_report.${ext}`;
  try {
    let clean = String(websiteUrl).trim().toLowerCase();
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    clean = clean.split('/')[0]; // take domain host part only
    // Remove top-level domain extension like .com, .org, .net if single TLD or preserve main name
    const parts = clean.split('.');
    if (parts.length > 1 && (parts[parts.length - 1] === 'com' || parts[parts.length - 1] === 'org' || parts[parts.length - 1] === 'net' || parts[parts.length - 1] === 'io')) {
      clean = parts.slice(0, -1).join('-');
    } else {
      clean = clean.replace(/\./g, '-');
    }
    clean = clean.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `${clean || 'website'}_seo_report.${ext}`;
  } catch (e) {
    return `seo_report.${ext}`;
  }
};

/**
 * Generate PDF Report for a given audit ID.
 * POST /api/v1/reports/<audit_id>/pdf/
 */
export const generateReport = async (auditId) => {
  try {
    const res = await api.post(`/api/v1/reports/${auditId}/pdf/`);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.error || err.response?.data?.detail || 'Failed to generate PDF report.',
    };
  }
};

/**
 * Download PDF Report for a given audit ID.
 * GET /api/v1/reports/<audit_id>/download/
 */
export const downloadReport = async (auditId, filename) => {
  try {
    const res = await api.get(`/api/v1/reports/${auditId}/download/`, {
      responseType: 'blob',
    });

    const targetFilename = filename || `seo-report-${auditId}.pdf`;
    
    // Trigger direct browser file download
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', targetFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    let errorMsg = 'Failed to download PDF report.';
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        errorMsg = json.error || json.detail || errorMsg;
      } catch (e) {
        // Fallback to default message
      }
    } else if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    }
    return { success: false, message: errorMsg };
  }
};

/**
 * Email PDF Report to recipient email address.
 * POST /api/v1/reports/<audit_id>/email/
 */
export const emailReport = async (auditId, email) => {
  try {
    const res = await api.post(`/api/v1/reports/${auditId}/email/`, { email });
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.error || err.response?.data?.detail || 'Failed to email report.',
    };
  }
};

/**
 * Export CSV Summary report for an audit ID.
 * GET /api/v1/reports/<audit_id>/csv/
 */
export const exportCSV = async (auditId, filename) => {
  try {
    const res = await api.get(`/api/v1/reports/${auditId}/csv/`, {
      responseType: 'blob',
    });

    const targetFilename = filename || `seo-report-${auditId}.csv`;

    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', targetFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    let errorMsg = 'Failed to export CSV report.';
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        errorMsg = json.error || json.detail || errorMsg;
      } catch (e) {
        // Fallback
      }
    } else if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    }
    return { success: false, message: errorMsg };
  }
};

/**
 * Export JSON Summary report for an audit ID.
 * GET /api/v1/reports/<audit_id>/json/
 */
export const exportJSON = async (auditId, filename) => {
  try {
    const res = await api.get(`/api/v1/reports/${auditId}/json/`, {
      responseType: 'blob',
    });

    const targetFilename = filename || `seo-report-${auditId}.json`;

    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', targetFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    let errorMsg = 'Failed to export JSON report.';
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        errorMsg = json.error || json.detail || errorMsg;
      } catch (e) {
        // Fallback
      }
    } else if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    }
    return { success: false, message: errorMsg };
  }
};

/**
 * Fetch current user white-label branding settings.
 * GET /api/v1/reports/branding/
 */
export const getBranding = async () => {
  try {
    const res = await api.get('/api/v1/reports/branding/');
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.error || 'Failed to fetch branding settings.',
    };
  }
};

/**
 * Update user white-label branding settings.
 * PUT /api/v1/reports/branding/
 */
export const updateBranding = async (brandingData) => {
  try {
    const res = await api.put('/api/v1/reports/branding/', brandingData);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.error || err.response?.data?.detail || 'Failed to update branding settings.',
    };
  }
};

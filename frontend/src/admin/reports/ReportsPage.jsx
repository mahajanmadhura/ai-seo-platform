import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminApi from '../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AdminHeader from '../components/ui/AdminHeader';
import AdminErrorState from '../components/ui/AdminErrorState';
import ReportSelector from './components/ReportSelector';
import ReportFilters from './components/ReportFilters';
import ReportPreview from './components/ReportPreview';
import ReportSkeleton from './components/ReportSkeleton';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('revenue');

  // Filters State
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  // Directory Options
  const [usersList, setUsersList] = useState([]);
  const [websitesList, setWebsitesList] = useState([]);

  // Data & State
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { addToast } = useToast();

  // Load Dropdown Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [usersRes, websitesRes] = await Promise.all([
          adminApi.getUsers(1).catch(() => ({ data: [] })),
          adminApi.getWebsites({ page: 1 }).catch(() => ({ data: [] })),
        ]);
        setUsersList(usersRes.data || []);
        setWebsitesList(websitesRes.data || []);
      } catch (err) {
        console.error('Failed to load filter dropdown options', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch Report Telemetry
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        report_type: selectedReport,
        date_range: dateRange,
        start_date: startDate,
        end_date: endDate,
        user_id: userFilter,
        status: statusFilter,
        website_id: websiteFilter,
      };
      const res = await adminApi.getReportsData(params);
      setReportData(res.data || res);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report data');
      addToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [selectedReport]);

  // Handle Download Exports
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = {
        report_type: selectedReport,
        format: format,
        date_range: dateRange,
        start_date: startDate,
        end_date: endDate,
        user_id: userFilter,
        status: statusFilter,
        website_id: websiteFilter,
      };
      await adminApi.downloadReportExport(params);
      addToast(`Report exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Failed to export report document', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left pb-16 font-sans overflow-x-hidden"
    >
      {/* Standardized Header */}
      <AdminHeader
        title="Reports"
        lastUpdated={lastRefreshed}
        onRefresh={handleGenerateReport}
        loading={loading}
      />

      {/* STEP 1: Interactive Report Selection Cards */}
      <ReportSelector
        selectedReport={selectedReport}
        onSelectReport={setSelectedReport}
      />

      {/* STEP 2: Filter Parameters with Enterprise Dropdowns */}
      <ReportFilters
        selectedReport={selectedReport}
        dateRange={dateRange}
        setDateRange={setDateRange}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        websiteFilter={websiteFilter}
        setWebsiteFilter={setWebsiteFilter}
        usersList={usersList}
        websitesList={websitesList}
        loading={loading}
        onGenerate={handleGenerateReport}
      />

      {/* Error View */}
      {error && <AdminErrorState message={error} onRetry={handleGenerateReport} />}

      {/* STEP 3 & 4: Report Skeleton or Report Preview Container */}
      {!error && (
        <>
          {loading ? (
            <ReportSkeleton />
          ) : (
            <ReportPreview
              selectedReport={selectedReport}
              reportData={reportData}
              loading={loading}
              exporting={exporting}
              onExport={handleExport}
            />
          )}
        </>
      )}
    </motion.div>
  );
}

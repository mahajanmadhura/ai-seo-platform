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

  // Dynamic Filters State
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  // Directory Options for Dropdowns
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

  // Fetch Report Telemetry (Synchronized for Live Preview)
  const fetchReportData = async () => {
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
        gateway: gatewayFilter,
        website_id: websiteFilter,
      };
      const res = await adminApi.getReportsData(params);
      setReportData(res.data || res);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load report data');
      addToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live Automatic Synchronization (300ms Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReportData();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedReport, dateRange, startDate, endDate, userFilter, statusFilter, gatewayFilter, websiteFilter]);

  // Handle Download Exports (PDF, Excel, JSON)
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
        gateway: gatewayFilter,
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
      {/* Standardized Admin Header */}
      <AdminHeader
        title="Reports Center"
        lastUpdated={lastRefreshed}
        onRefresh={fetchReportData}
        loading={loading}
      />

      {/* STEP 1: Interactive Report Selection Cards */}
      <ReportSelector
        selectedReport={selectedReport}
        onSelectReport={(report) => {
          setSelectedReport(report);
          // Reset specific filters when switching report category for clean UX
          setUserFilter('all');
          setStatusFilter('all');
          setGatewayFilter('all');
          setWebsiteFilter('all');
        }}
      />

      {/* STEP 2: Declarative Dynamic Filter System */}
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
        gatewayFilter={gatewayFilter}
        setGatewayFilter={setGatewayFilter}
        websiteFilter={websiteFilter}
        setWebsiteFilter={setWebsiteFilter}
        usersList={usersList}
        websitesList={websitesList}
        loading={loading}
        onRefresh={fetchReportData}
      />

      {/* Error View */}
      {error && <AdminErrorState message={error} onRetry={fetchReportData} />}

      {/* STEP 3 & 4: Live Preview & Export Pipeline */}
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

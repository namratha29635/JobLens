import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { coordinatorAPI, onCampusAPI, openResume } from '../../services/api';
import { Card, Badge, Table, Tr, Td, LoadingPage, EmptyState, Tabs, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  registered: 'default',
  shortlisted: 'primary',
  in_progress: 'purple',
  selected: 'success',
  rejected: 'danger',
  not_shortlisted: 'danger',
};

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
const BATCHES = [2026, 2027, 2028, 2029];

export default function CoordinatorApplications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [summary, setSummary] = useState({ total: 0, registered: 0, shortlisted: 0, in_progress: 0, selected: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDrive, setSelectedDrive] = useState(searchParams.get('driveId') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [batchFilter, setBatchFilter] = useState(searchParams.get('batch') || '');
  const [branchFilter, setBranchFilter] = useState(searchParams.get('branch') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch drives for filter dropdown
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await onCampusAPI.getAll({ limit: 100 });
        setDrives(res.data.data.drives || []);
      } catch {
        // silent
      }
    };
    fetchDrives();
  }, []);

  const fetchApplications = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit: 25 };
      if (selectedDrive) params.driveId = selectedDrive;
      if (statusFilter) params.status = statusFilter;
      if (batchFilter) params.batch = batchFilter;
      if (branchFilter) params.branch = branchFilter;
      if (search.trim()) params.search = search.trim();

      const res = await coordinatorAPI.getAllApplications(params);
      setApplications(res.data.data.applications || []);
      setSummary(res.data.data.summary || {});
      setTotalPages(res.data.data.pagination.pages || 1);
      setPage(targetPage);
    } catch {
      toast.error('Failed to load drive applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
    setSelectedIds([]);
  }, [selectedDrive, statusFilter, batchFilter, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications(1);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await coordinatorAPI.updateApplicationStatus(appId, { overallStatus: newStatus });
      toast.success(`Application updated to ${newStatus}`);
      fetchApplications(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!selectedIds.length) return toast.error('No students selected');
    setBulkActionLoading(true);
    try {
      await coordinatorAPI.bulkUpdateApplications({ applicationIds: selectedIds, overallStatus: newStatus });
      toast.success(`Updated ${selectedIds.length} applications to ${newStatus}`);
      setSelectedIds([]);
      fetchApplications(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((a) => a._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const exportCSV = () => {
    if (!applications.length) return toast.error('No data to export');
    const headers = ['Roll Number', 'Name', 'Branch', 'Batch', 'CGPA', 'Backlogs', 'Company', 'Package', 'Status', 'Email', 'Applied At'];
    const rows = applications.map((a) => [
      a.student?.rollNumber || '',
      `"${a.student?.name || ''}"`,
      a.student?.branch || '',
      a.student?.passedOutYear || '',
      a.student?.cgpa || '',
      a.student?.activeBacklogs || '0',
      `"${a.drive?.companyName || ''}"`,
      `"${a.drive?.minPackage ? `${a.drive.minPackage}-${a.drive.maxPackage} LPA` : ''}"`,
      a.overallStatus || '',
      a.student?.collegeEmail || '',
      a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Applications_${selectedDrive ? 'Drive' : 'All'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications exported as CSV');
  };

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            📥 Student Applications Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Review, shortlist, and dispatch updates to students who applied to recruitment drives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={exportCSV}
            style={{
              padding: '9px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📊 Export CSV
          </button>

          <button
            onClick={() => navigate('/coordinator/notify')}
            style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, var(--accent-primary), #0284c7)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📢 Send Broadcast Email
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Received', count: summary.total, color: 'var(--accent-primary)', icon: '📥' },
          { label: 'Registered', count: summary.registered, color: 'var(--text-secondary)', icon: '📝' },
          { label: 'Shortlisted', count: summary.shortlisted, color: '#38bdf8', icon: '🎯' },
          { label: 'In Progress', count: summary.in_progress, color: '#a78bfa', icon: '🔄' },
          { label: 'Selected / Placed', count: summary.selected, color: 'var(--accent-green)', icon: '🏆' },
          { label: 'Rejected', count: summary.rejected, color: 'var(--accent-red)', icon: '❌' },
        ].map((kpi, idx) => (
          <Card key={idx} style={{ padding: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {kpi.label}
              </span>
              <span>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: kpi.color }}>
              {kpi.count ?? 0}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Drive Selector */}
          <div style={{ flex: 1.5, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
              FILTER BY RECRUITMENT DRIVE
            </label>
            <select
              style={{ ...inputStyle, width: '100%' }}
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
            >
              <option value="">🏢 All Placement Drives ({drives.length})</option>
              {drives.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.companyName} {d.minPackage ? `(${d.minPackage}-${d.maxPackage} LPA)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div style={{ flex: 0.8, minWidth: '120px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
              BATCH
            </label>
            <select
              style={{ ...inputStyle, width: '100%' }}
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="">All Batches</option>
              {BATCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div style={{ flex: 0.8, minWidth: '120px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
              BRANCH
            </label>
            <select
              style={{ ...inputStyle, width: '100%' }}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ flex: 1.5, minWidth: '220px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
              SEARCH STUDENT / ROLL NO
            </label>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Search by student name, roll #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs
        tabs={[
          { value: '', label: `All (${summary.total || 0})` },
          { value: 'registered', label: `Registered (${summary.registered || 0})` },
          { value: 'shortlisted', label: `Shortlisted (${summary.shortlisted || 0})` },
          { value: 'in_progress', label: `In Progress (${summary.in_progress || 0})` },
          { value: 'selected', label: `Selected (${summary.selected || 0})` },
          { value: 'rejected', label: `Rejected (${summary.rejected || 0})` },
        ]}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>
            ✓ {selectedIds.length} Student{selectedIds.length === 1 ? '' : 's'} Selected
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleBulkStatusChange('shortlisted')}
              disabled={bulkActionLoading}
              style={{ padding: '6px 14px', background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              Shortlist Selected
            </button>
            <button
              onClick={() => handleBulkStatusChange('selected')}
              disabled={bulkActionLoading}
              style={{ padding: '6px 14px', background: 'var(--accent-green)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              Mark Selected
            </button>
            <button
              onClick={() => handleBulkStatusChange('rejected')}
              disabled={bulkActionLoading}
              style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              Reject Selected
            </button>
            <button
              onClick={() => {
                navigate(`/coordinator/notify?driveId=${selectedDrive}&status=${statusFilter}`);
              }}
              style={{ padding: '6px 14px', background: 'rgba(124, 58, 237, 0.2)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.4)', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              ✉ Email Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Applications Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingPage text="Loading applicant records..." />
        ) : applications.length === 0 ? (
          <EmptyState
            icon="📥"
            title="No Applications Found"
            description="No student applications match the selected drive or filter criteria."
          />
        ) : (
          <div>
            <Table
              headers={[
                <input
                  type="checkbox"
                  checked={selectedIds.length === applications.length && applications.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />,
                'Candidate',
                'Academic Info',
                'Company & Drive',
                'Resume',
                'Status',
                'Applied On',
                'Manage Action',
              ]}
            >
              {applications.map((app) => (
                <Tr key={app._id}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app._id)}
                      onChange={() => toggleSelectOne(app._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </Td>

                  {/* Student Candidate */}
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                        {app.student?.name || 'Unknown Student'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {app.student?.rollNumber} · {app.student?.collegeEmail}
                      </span>
                    </div>
                  </Td>

                  {/* Academic Info */}
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {app.student?.branch} ({app.student?.passedOutYear})
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        CGPA: <strong>{app.student?.cgpa ?? '—'}</strong> | Backlogs: {app.student?.activeBacklogs ?? 0}
                      </span>
                    </div>
                  </Td>

                  {/* Company & Drive */}
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>
                        {app.drive?.companyName || 'General Drive'}
                      </span>
                      {app.drive?.minPackage && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>
                          💰 {app.drive.minPackage}-{app.drive.maxPackage} LPA
                        </span>
                      )}
                    </div>
                  </Td>

                  {/* Resume Snapshot */}
                  <Td>
                    {app.resumeSnapshot || app.student?.resume?.url ? (
                      <button
                        type="button"
                        onClick={() => openResume(app.resumeSnapshot || app.student?.resume?.url)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: 'rgba(0, 212, 255, 0.12)',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          borderRadius: '6px',
                          color: 'var(--accent-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📄 View PDF
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No Resume</span>
                    )}
                  </Td>

                  {/* Application Status Badge */}
                  <Td>
                    <Badge variant={STATUS_COLORS[app.overallStatus] || 'default'} size="sm">
                      {app.overallStatus?.toUpperCase()}
                    </Badge>
                  </Td>

                  {/* Applied Date */}
                  <Td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                    </span>
                  </Td>

                  {/* Action Selector */}
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                        value={app.overallStatus}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="registered">Registered</option>
                        <option value="shortlisted">Shortlist</option>
                        <option value="in_progress">In Progress</option>
                        <option value="selected">Select (Placed)</option>
                        <option value="rejected">Reject</option>
                        <option value="not_shortlisted">Not Shortlisted</option>
                      </select>

                      <button
                        onClick={() => navigate(`/coordinator/notify?email=${encodeURIComponent(app.student?.collegeEmail || '')}`)}
                        title="Send Direct Email to Student"
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(124, 58, 237, 0.12)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          borderRadius: '6px',
                          color: '#c084fc',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        ✉
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({summary.total || 0} total applications)
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => fetchApplications(page - 1)}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                  }}
                >
                  ← Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchApplications(page + 1)}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

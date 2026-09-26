import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Globe,
  Mail,
  DollarSign,
  FileText,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Clock,
  Briefcase,
} from 'lucide-react';
import { initialJobs } from '../../data/mockData';
import { Button, Badge, VerificationBadge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function CoordinatorVerifyJobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified', 'flagged', 'all'
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter jobs based on active tab and search
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return job.verificationStatus === 'pending';
    if (activeTab === 'verified') return job.verificationStatus === 'verified';
    if (activeTab === 'flagged') return job.verificationStatus === 'suspicious';
    return true;
  });

  const pendingCount = jobs.filter((j) => j.verificationStatus === 'pending').length;
  const verifiedCount = jobs.filter((j) => j.verificationStatus === 'verified').length;
  const flaggedCount = jobs.filter((j) => j.verificationStatus === 'suspicious').length;

  const handleApprove = (jobId, level = 'Level 3') => {
    setJobs(
      jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              verificationStatus: 'verified',
              verificationLevel: level,
              isApprovedByCoordinator: true,
              safetyScore: 98,
            }
          : j
      )
    );
    toast.success(`Posting approved and certified as ${level}! Published to student portal.`);
    setSelectedJob(null);
  };

  const handleReject = (jobId, reason) => {
    setJobs(
      jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              verificationStatus: 'suspicious',
              verificationLevel: 'Unverified',
              isApprovedByCoordinator: false,
              safetyScore: 25,
            }
          : j
      )
    );
    toast.error(`Posting marked as suspicious/rejected. Students will be protected.`);
    setSelectedJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck className="text-blue-600" size={28} />
            Job Verification & Fraud Prevention Registry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Review, validate recruiter credentials, check corporate registries, and issue Level 1–3 verification badges for campus drives.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            AI Engine: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Active (v2.4)</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div
          onClick={() => setActiveTab('pending')}
          style={{
            background: activeTab === 'pending' ? '#eff6ff' : '#ffffff',
            border: activeTab === 'pending' ? '2px solid var(--brand)' : '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>Action Required</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pending Verification Queue</div>
        </div>

        <div
          onClick={() => setActiveTab('verified')}
          style={{
            background: activeTab === 'verified' ? '#f0fdf4' : '#ffffff',
            border: activeTab === 'verified' ? '2px solid #16a34a' : '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Certified Safe</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{verifiedCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Approved & Active Drives</div>
        </div>

        <div
          onClick={() => setActiveTab('flagged')}
          style={{
            background: activeTab === 'flagged' ? '#fef2f2' : '#ffffff',
            border: activeTab === 'flagged' ? '2px solid #dc2626' : '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Fraud Risk</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{flaggedCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Blocked / Suspicious Submissions</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          style={{
            background: activeTab === 'all' ? '#f8fafc' : '#ffffff',
            border: activeTab === 'all' ? '2px solid #64748b' : '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>All Postings</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{jobs.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Database Registry</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search submitted jobs by company or job role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'pending', label: `Pending Review (${pendingCount})` },
            { key: 'verified', label: `Verified (${verifiedCount})` },
            { key: 'flagged', label: `Flagged (${flaggedCount})` },
            { key: 'all', label: `All (${jobs.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === tab.key ? 'var(--brand)' : '#f1f5f9',
                color: activeTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Table */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '14px 18px' }}>Company & Job Title</th>
                <th style={{ padding: '14px 18px' }}>Package / CTC</th>
                <th style={{ padding: '14px 18px' }}>AI Trust Score</th>
                <th style={{ padding: '14px 18px' }}>Current Status</th>
                <th style={{ padding: '14px 18px' }}>Badge Tier</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const score = job.safetyScore || 90;
                const scoreColor = score >= 85 ? '#16a34a' : score >= 60 ? '#ea580c' : '#dc2626';

                return (
                  <tr
                    key={job.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {job.company?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{job.company}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.title} • {job.location}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.ctc}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: scoreColor }} />
                        <span style={{ fontWeight: 700, color: scoreColor }}>{score}% Trust</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {job.verificationStatus === 'verified' && <Badge variant="success">Verified</Badge>}
                      {job.verificationStatus === 'pending' && <Badge variant="warning">Pending Review</Badge>}
                      {job.verificationStatus === 'suspicious' && <Badge variant="danger">High Risk / Scam</Badge>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <VerificationBadge level={job.verificationLevel} />
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Button size="sm" variant={job.verificationStatus === 'pending' ? 'primary' : 'outline'} onClick={() => setSelectedJob(job)}>
                        Audit & Verify
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Audit Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={14} /> Coordinator Verification Audit
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {selectedJob.title}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedJob.company} • {selectedJob.ctc} • {selectedJob.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>MCA & Corporate Registration Check</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified active corporate entity in registry with CIN L72200KA1994PLC016140</div>
                  </div>
                </div>
                <Badge variant="success">Validated</Badge>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Recruiter Email & MX Domain Check</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email sent from authenticated corporate domain (e.g., @company.com)</div>
                  </div>
                </div>
                <Badge variant="success">Authenticated</Badge>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: selectedJob.verificationStatus === 'suspicious' ? '#fee2e2' : '#dcfce7', color: selectedJob.verificationStatus === 'suspicious' ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedJob.verificationStatus === 'suspicious' ? <X size={18} /> : <Check size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Zero-Fee & No Financial Deposit Guarantee</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {selectedJob.verificationStatus === 'suspicious' ? 'Flagged: Posting contains suspicious request for laptop/training deposit fee' : 'Confirmed: Zero application fees, security deposits, or bond fees'}
                    </div>
                  </div>
                </div>
                <Badge variant={selectedJob.verificationStatus === 'suspicious' ? 'danger' : 'success'}>
                  {selectedJob.verificationStatus === 'suspicious' ? 'Violation' : 'Compliant'}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <Button variant="danger" onClick={() => handleReject(selectedJob.id)}>
                <XCircle size={16} /> Flag as Fraud / Reject
              </Button>
              <Button variant="secondary" onClick={() => handleApprove(selectedJob.id, 'Level 2')}>
                Approve as Level 2 (Institutional)
              </Button>
              <Button variant="primary" onClick={() => handleApprove(selectedJob.id, 'Level 3')}>
                <CheckCircle2 size={16} /> Approve as Level 3 (Verified)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

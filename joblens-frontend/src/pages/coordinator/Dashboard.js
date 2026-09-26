import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Briefcase,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { initialJobs, initialApplications, initialStudents } from '../../data/mockData';
import { StatCard, Button, Badge, VerificationBadge } from '../../components/ui';
import toast from 'react-hot-toast';

const BATCH_PLACEMENT_DATA = [
  { branch: 'CSE', placed: 162, total: 180 },
  { branch: 'IT', placed: 104, total: 120 },
  { branch: 'ECE', placed: 108, total: 140 },
  { branch: 'EEE', placed: 62, total: 90 },
  { branch: 'Mech', placed: 68, total: 110 },
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(initialJobs);

  const pendingJobs = jobs.filter((j) => j.verificationStatus === 'pending');
  const verifiedJobs = jobs.filter((j) => j.verificationStatus === 'verified');

  const handleQuickApprove = (jobId, e) => {
    e.stopPropagation();
    setJobs(
      jobs.map((j) =>
        j.id === jobId
          ? { ...j, verificationStatus: 'verified', verificationLevel: 'Level 3', isApprovedByCoordinator: true }
          : j
      )
    );
    toast.success('Job verified & approved (Level 3)! Broadcast to student portal.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '26px 30px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37, 99, 235, 0.25)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, color: '#93c5fd', marginBottom: '8px' }}>
            <ShieldCheck size={13} /> University Placement & Verification Headquarters
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Placement Coordinator Overview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Monitor real-time company recruitment drives, audit fraud checks, and review student application metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => navigate('/coordinator/postings')}>
            <Plus size={16} /> New Placement Drive
          </Button>
          <Button
            style={{ background: '#4f46e5', color: '#ffffff', border: 'none' }}
            onClick={() => navigate('/coordinator/notify')}
          >
            <Send size={15} /> Real-Time Broadcast
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Active Job Postings"
          value={jobs.length}
          icon={Briefcase}
          trend="+4 this week"
          trendType="up"
        />
        <StatCard
          label="Pending Verification"
          value={pendingJobs.length}
          icon={ShieldAlert}
          color="#ea580c"
          bgColor="#fff7ed"
          trend="Requires audit"
          trendType="neutral"
        />
        <StatCard
          label="Registered Students"
          value="720"
          icon={Users}
          color="#7c3aed"
          bgColor="#f5f3ff"
          trend="Batch 2026"
          trendType="up"
        />
        <StatCard
          label="Placement Rate"
          value="76.4%"
          icon={TrendingUp}
          color="#16a34a"
          bgColor="#f0fdf4"
          trend="+12% YoY"
          trendType="up"
        />
      </div>

      {/* Main Content Grid: Verification Queue & Broadcast Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Verification Action Queue */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Verification Queue ({pendingJobs.length} Pending)
              </h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/coordinator/verify')}>
              Full Registry <ArrowRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => navigate('/coordinator/verify')}
                style={{
                  padding: '14px',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{job.company}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.title} • {job.ctc}</div>
                  <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
                    MCA Registry Check Pending • {job.location}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button size="sm" variant="primary" onClick={(e) => handleQuickApprove(job.id, e)}>
                    Verify (L3)
                  </Button>
                </div>
              </div>
            ))}

            {pendingJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                All pending drives have been audited and verified!
              </div>
            )}
          </div>
        </div>

        {/* Real-time Broadcast Card */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Real-Time Student Broadcast & Alerts
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Send instant high-priority email notices, assessment links, and drive updates to entire batches or specific branches.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginTop: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Quick Preset Announcements
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Google Technical Test Link', 'Deloitte Shortlist Released', 'Mock Interview Timings'].map((preset) => (
                  <span
                    key={preset}
                    onClick={() => navigate('/coordinator/notify')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#eff6ff',
                      color: 'var(--brand)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {preset}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => navigate('/coordinator/notify')}>
              Open Broadcast Studio →
            </Button>
          </div>
        </div>
      </div>

      {/* Placement Conversion by Branch Chart */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Batch 2026 Branch Placement Rates
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Comparison of placed students vs registered students by department
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/coordinator/reports')}>
            Detailed Analytics
          </Button>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={BATCH_PLACEMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="total" name="Registered Students" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
            <Bar dataKey="placed" name="Placed Students" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

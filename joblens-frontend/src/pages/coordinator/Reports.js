import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Building2,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Button, Card, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const BRANCH_DATA = [
  { branch: 'CSE', total: 180, placed: 162, rate: 90 },
  { branch: 'IT', total: 120, placed: 104, rate: 86.6 },
  { branch: 'ECE', total: 140, placed: 108, rate: 77.1 },
  { branch: 'EEE', total: 90, placed: 62, rate: 68.8 },
  { branch: 'Mech', total: 110, placed: 68, rate: 61.8 },
  { branch: 'Civil', total: 80, placed: 44, rate: 55 },
];

const SALARY_DISTRIBUTION = [
  { range: '3 - 6 LPA', count: 180, fill: '#94a3b8' },
  { range: '6 - 10 LPA', count: 210, fill: '#3b82f6' },
  { range: '10 - 18 LPA', count: 125, fill: '#8b5cf6' },
  { range: '18 - 28 LPA', count: 48, fill: '#10b981' },
  { range: '28+ LPA (Marquee)', count: 22, fill: '#f59e0b' },
];

const TIER_DATA = [
  { name: 'Product / Tier 1 (18+ LPA)', value: 70, color: '#8b5cf6' },
  { name: 'Core / IT Tier 2 (8-18 LPA)', value: 165, color: '#3b82f6' },
  { name: 'Mass / Service Tier 3 (4-8 LPA)', value: 240, color: '#10b981' },
];

export default function CoordinatorReports() {
  const [selectedBatch, setSelectedBatch] = useState('2026');

  const handleExportCSV = () => {
    toast.success('Generating and downloading Placement Report (CSV)...');
  };

  const handleExportPDF = () => {
    toast.success('Generating University Placement Executive Summary (PDF)...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 className="text-blue-600" size={26} />
            Placement Reports & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Interactive analytics on branch-wise conversion rates, salary bands, partner hiring trends, and verified audit metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="2026">Batch 2026 (Graduating)</option>
            <option value="2025">Batch 2025 (Completed)</option>
            <option value="2024">Batch 2024</option>
          </select>

          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={15} /> Export CSV
          </Button>

          <Button variant="primary" onClick={handleExportPDF}>
            <Download size={15} /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* Top Highlights Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Placement Rate</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>76.4%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>548 of 720 students placed</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average CTC Offered</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand)', marginTop: '4px' }}>11.8 LPA</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>+18% growth vs Batch 2025</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highest CTC Package</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>44.5 LPA</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Offered by Google & AWS</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Companies</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>64 Partners</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>100% Zero-Fraud Verified</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Branch-wise Placements Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Branch-wise Students Placed vs Total
            </h3>
            <Badge variant="info">Batch {selectedBatch}</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BRANCH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="total" name="Total Registered" fill="var(--border)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="placed" name="Placed Students" fill="var(--brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution CTC Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Compensation CTC Distribution (Offers Count)
            </h3>
            <Badge variant="purple">Annual Packages</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SALARY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Bar dataKey="count" name="Offers Accepted" radius={[6, 6, 0, 0]}>
                {SALARY_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recruiter Tier Breakdown and Hiring Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Offers by Company Tier Breakdown
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '180px', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={TIER_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {TIER_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TIER_DATA.map((tier) => (
                <div key={tier.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: tier.color }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tier.name}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{tier.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Top Recruiting Corporate Partners
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { company: 'Tata Consultancy Services', hired: 112, avgCtc: '7.5 LPA', verified: true },
              { company: 'Deloitte India', hired: 48, avgCtc: '9.2 LPA', verified: true },
              { company: 'Amazon Web Services (AWS)', hired: 24, avgCtc: '22.0 LPA', verified: true },
              { company: 'Google Cloud India', hired: 14, avgCtc: '32.0 LPA', verified: true },
            ].map((recruiter) => (
              <div
                key={recruiter.company}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                    {recruiter.company[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{recruiter.company}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg CTC: {recruiter.avgCtc}</div>
                  </div>
                </div>
                <Badge variant="success">{recruiter.hired} Students Hired</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

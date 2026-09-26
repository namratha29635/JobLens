import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Bell,
  Lock,
  Building2,
  Mail,
  Sliders,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function CoordinatorSettings() {
  const [minCgpaDefault, setMinCgpaDefault] = useState('6.5');
  const [maxBacklogsAllowed, setMaxBacklogsAllowed] = useState('0');
  const [autoVerifyKnownPartners, setAutoVerifyKnownPartners] = useState(true);
  const [strictDepositScan, setStrictDepositScan] = useState(true);
  const [emailAlertsOnStudentApply, setEmailAlertsOnStudentApply] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    toast.success('Placement policy & verification rules updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings className="text-blue-600" size={26} />
          Placement Cell Configuration & Policy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Configure institutional eligibility baselines, automated fraud scanning thresholds, and notification webhooks.
        </p>
      </div>

      {/* Verification & Fraud Security Policy */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI Job Verification & Fraud Shield Rules
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Automated checks executed before postings are displayed on the Student Portal.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Automatic Pre-Screening for Accredited Partners</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automatically grant Level 2 Institutional badge for pre-approved MOU partner companies.</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={autoVerifyKnownPartners}
                onChange={(e) => setAutoVerifyKnownPartners(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  inset: 0,
                  backgroundColor: autoVerifyKnownPartners ? 'var(--brand)' : '#cbd5e1',
                  borderRadius: '24px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    height: '18px',
                    width: '18px',
                    left: autoVerifyKnownPartners ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Mandatory Deposit / Upfront Fee Flagging</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instantly quarantine and flag any job description or email mentioning "training cost", "laptop deposit", or "registration fees".</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={strictDepositScan}
                onChange={(e) => setStrictDepositScan(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  inset: 0,
                  backgroundColor: strictDepositScan ? 'var(--brand)' : '#cbd5e1',
                  borderRadius: '24px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    height: '18px',
                    width: '18px',
                    left: strictDepositScan ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s',
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Default Eligibility Parameters */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Default Institutional Eligibility Criteria
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Preset eligibility criteria applied automatically when creating new placement drives.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePolicy} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Minimum CGPA Cutoff
            </label>
            <input
              type="number"
              step="0.1"
              value={minCgpaDefault}
              onChange={(e) => setMinCgpaDefault(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Maximum Active Backlogs Permitted
            </label>
            <input
              type="number"
              value={maxBacklogsAllowed}
              onChange={(e) => setMaxBacklogsAllowed(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="submit" variant="primary">
              <Save size={15} /> Save Placement Policies
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

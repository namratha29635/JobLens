import React from 'react';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  ExternalLink,
  Mail,
  UserCheck,
  Check,
} from 'lucide-react';
import { Button, Badge, VerificationBadge, Modal } from './index';

export default function JobDetailsModal({ job, open = true, onClose, onApply, isSaved, onToggleSave }) {
  if (!job) return null;

  return (
    <Modal open={open} onClose={onClose} title={job.title} subtitle={`${job.company} • ${job.location}`} width="840px">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 1fr)', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Column: Job Details, Requirements, Responsibilities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                flexShrink: 0,
              }}
            >
              {job.logo ? (
                <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={28} color="#64748b" />
              )}
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{job.company}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{job.category || 'Engineering & Technology'}</div>
              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                >
                  Visit Company Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Salary / CTC</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>{job.salary || job.ctc}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Employment Type</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{job.type}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Location</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{job.location}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Experience / Batch</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{job.experience || '2026 Batch'}</div>
            </div>
          </div>

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Required Skills & Technologies
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map((s, idx) => (
                  <Badge key={idx} variant="primary" size="md">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              About the Role
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {job.description || 'Join our high performing engineering team to build scalable systems and next-generation applications.'}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Key Responsibilities
              </h4>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {job.responsibilities.map((r, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Eligibility & Candidate Requirements
              </h4>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {job.requirements.map((req, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Perks & Benefits
              </h4>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {job.benefits.map((b, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sticky Card: Apply, Save, Verification Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Application Window</span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>Ready to apply?</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Apply with your verified college profile and resume in 1 click.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  onApply && onApply(job);
                  onClose();
                }}
                style={{ width: '100%' }}
              >
                Apply Now ⚡
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => onToggleSave && onToggleSave(job.id)}
                style={{ width: '100%' }}
              >
                <Bookmark size={15} fill={isSaved ? '#2563eb' : 'none'} />
                {isSaved ? 'Job Saved' : 'Save Job'}
              </Button>
            </div>

            {/* Verification Checklist */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                JobVerifier™ Security Check
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Company Authenticity Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Job Offer & Salary Details Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Official Recruiter Verified</span>
              </div>
            </div>

            {/* Recruiter info box */}
            {job.recruiter && (
              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hiring Lead</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{job.recruiter.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.recruiter.role}</div>
                <div style={{ fontSize: '11px', color: 'var(--brand)', marginTop: '4px' }}>{job.recruiter.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

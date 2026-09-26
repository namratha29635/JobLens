import React, { useState } from 'react';
import {
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { initialJobs } from '../../data/mockData';
import { Button, Badge, VerificationBadge } from '../../components/ui';
import JobDetailsModal from '../../components/ui/JobDetailsModal';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState(['job-1', 'job-2', 'job-4']);
  const [selectedJob, setSelectedJob] = useState(null);

  const savedJobs = initialJobs.filter((job) => savedJobIds.includes(job.id));

  const removeSaved = (id, e) => {
    e.stopPropagation();
    setSavedJobIds(savedJobIds.filter((jobId) => jobId !== id));
    toast.success('Job removed from saved list');
  };

  const handleApply = (job) => {
    toast.success(`Application submitted for ${job.title} at ${job.company}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bookmark className="text-blue-600" size={26} />
          Saved Jobs & Opportunities
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Jobs and internship postings you have bookmarked for quick review and direct application before deadlines.
        </p>
      </div>

      {savedJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {savedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div>
                {/* Header with Verification */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: 'var(--brand)',
                      }}
                    >
                      {job.company?.[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {job.company}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {job.location}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => removeSaved(job.id, e)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      color: '#dc2626',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove from saved"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {job.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <VerificationBadge level={job.verificationLevel} />
                  <Badge variant="neutral">{job.type}</Badge>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Package (CTC):</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)' }}>{job.ctc}</div>
                </div>

                {/* Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {job.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: 'var(--text-secondary)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px 4px' }}>
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <Button
                  size="sm"
                  variant="primary"
                  style={{ flex: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job);
                  }}
                >
                  Apply Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            padding: '54px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Bookmark size={26} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Saved Jobs Yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
            When you browse drives, click the bookmark icon on any job card to save it here for quick access later.
          </p>
        </div>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={(job) => {
            handleApply(job);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}

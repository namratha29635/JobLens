import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ExternalLink,
  ChevronRight,
  Layers,
  ListFilter,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  UserCheck,
  Award,
  XCircle,
} from 'lucide-react';
import { initialApplications } from '../../data/mockData';
import { Badge, Button, VerificationBadge } from '../../components/ui';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'Applied', label: 'Applied', color: '#64748b', bg: '#f1f5f9' },
  { id: 'Shortlisted', label: 'Shortlisted', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'Online Assessment', label: 'Assessment', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'Interview Round 1', label: 'Technical Round', color: '#ea580c', bg: '#ffedd5' },
  { id: 'Selected', label: 'Offer Released', color: '#16a34a', bg: '#dcfce7' },
];

export default function StudentApplications() {
  const [applications, setApplications] = useState(initialApplications);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [selectedApp, setSelectedApp] = useState(null);

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Selected':
        return <Badge variant="success">Offer Accepted / Selected</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Application Archived</Badge>;
      case 'Interview Round 1':
      case 'Interview Round 2':
        return <Badge variant="warning">Interview Scheduled</Badge>;
      case 'Online Assessment':
        return <Badge variant="purple">Assessment Pending</Badge>;
      case 'Shortlisted':
        return <Badge variant="info">Resume Shortlisted</Badge>;
      default:
        return <Badge variant="neutral">Under Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck2 className="text-blue-600" size={26} />
            My Application Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Track the real-time status, test links, and interview schedules of your active job applications.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'kanban' ? 'var(--brand)' : 'transparent',
              color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={14} /> Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'list' ? 'var(--brand)' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <ListFilter size={14} /> List View
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Applied</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{applications.length}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active In-Progress</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {applications.filter((a) => a.currentStage !== 'Selected' && a.currentStage !== 'Rejected').length}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interviews Pending</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {applications.filter((a) => a.currentStage.includes('Interview')).length}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Offers Received</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
              {applications.filter((a) => a.currentStage === 'Selected').length}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {STAGES.map((stage) => {
            const stageApps = applications.filter((app) => {
              if (stage.id === 'Applied') return app.currentStage === 'Applied';
              if (stage.id === 'Shortlisted') return app.currentStage === 'Shortlisted';
              if (stage.id === 'Online Assessment') return app.currentStage === 'Online Assessment';
              if (stage.id === 'Interview Round 1') return app.currentStage.includes('Interview');
              if (stage.id === 'Selected') return app.currentStage === 'Selected';
              return false;
            });

            return (
              <div
                key={stage.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '999px' }}>
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--brand)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)' }}>{app.company}</span>
                        <VerificationBadge level="Level 3" />
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {app.jobTitle}
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        CTC: <span style={{ color: 'var(--text-primary)' }}>{app.package}</span>
                      </div>

                      {app.interviewSchedule && (
                        <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: '#c2410c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Clock size={12} /> {app.interviewSchedule}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                        <span>Applied {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span style={{ color: 'var(--brand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          View <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '10px', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                      No applications currently in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  <th style={{ padding: '14px 18px' }}>Company & Role</th>
                  <th style={{ padding: '14px 18px' }}>Package / CTC</th>
                  <th style={{ padding: '14px 18px' }}>Applied Date</th>
                  <th style={{ padding: '14px 18px' }}>Current Stage</th>
                  <th style={{ padding: '14px 18px' }}>Next Action</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{app.company}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{app.jobTitle}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{app.package}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>{getStageBadge(app.currentStage)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {app.interviewSchedule ? (
                        <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {app.interviewSchedule}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting Coordinator Schedule</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                        View Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Timeline Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase' }}>Application Details</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedApp.company}</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedApp.jobTitle} • {selectedApp.package}</div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Verification Status:</span>
                <VerificationBadge level="Level 3" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Stage:</span>
                {getStageBadge(selectedApp.currentStage)}
              </div>
            </div>

            {/* Timeline Milestones */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.05em' }}>
                Hiring Timeline Progress
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={10} color="#ffffff" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Application Submitted</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Applied on {selectedApp.appliedDate} with primary verified resume</div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={10} color="#ffffff" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Shortlisted by Recruiter</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Profile met CGPA and technical skill prerequisites</div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: selectedApp.currentStage.includes('Interview') || selectedApp.currentStage === 'Selected' ? 'var(--accent-green)' : 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={10} color="#ffffff" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Technical Assessment / Interview</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedApp.interviewSchedule ? `Scheduled for ${selectedApp.interviewSchedule}` : 'In review with placement coordinator'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button style={{ flex: 1 }} onClick={() => setSelectedApp(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => {
                  toast.success('Placement Coordinator notified of your query!');
                  setSelectedApp(null);
                }}
              >
                Contact Coordinator
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, feedbackAPI } from '../../services/api';
import { Card, Badge, Modal, Tabs, LoadingPage, EmptyState, Alert } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_META = {
  registered:      { label: 'Registered', variant: 'warning',  icon: '📝' },
  shortlisted:     { label: 'Shortlisted for Round 1', variant: 'primary', icon: '⭐' },
  in_progress:     { label: 'In Progress', variant: 'primary', icon: '⚡' },
  selected:        { label: 'SELECTED 🎉', variant: 'success', icon: '🏆' },
  rejected:        { label: 'Not Qualified', variant: 'danger', icon: '❌' },
  not_shortlisted: { label: 'Not Shortlisted', variant: 'danger', icon: '❌' },
};

const POPULAR_COLLEGES = [
  'All Colleges',
  "Vignan's Lara Institute of Technology & Science",
  "Vignan's Foundation for Science, Technology & Research (Vignan University)",
  'VNR VJIET',
  'CBIT',
  'Vasavi College of Engineering',
  'JNTU Hyderabad',
  'IIT Hyderabad',
  'BITS Pilani',
  'SRM University',
  'VIT Vellore',
  'Chaitanya Bharathi Institute of Technology',
  'Osmania University College of Engineering',
  'Gokaraju Rangaraju Institute of Engineering & Technology (GRIET)',
];

const BRANCH_OPTIONS = ['All Branches', 'CSE', 'ECE', 'EEE', 'IT', 'AIDS', 'AIML', 'DS', 'MECH', 'CIVIL'];

function getExtendedDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + 20);
  return d;
}

function canApplyNow(drive) {
  const extendedDeadline = getExtendedDeadline(drive.registrationDeadline);
  if (!extendedDeadline) return !drive.overallStatus;
  return extendedDeadline >= new Date() && !drive.overallStatus;
}

export default function StudentDrives() {
  const [tab, setTab] = useState('active');
  const [drives, setDrives] = useState({ activeDrives: [], pastDrives: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedbackDrive, setFeedbackDrive] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState('All Colleges');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchDrives = async (college) => {
    try {
      const params = (college && college !== 'All Colleges') ? { college } : {};
      const res = await studentAPI.getOnCampusDrives(params);
      setDrives(res.data?.data || { activeDrives: [], pastDrives: [] });
    } catch {
      toast.error('Failed to load verified hiring drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives(selectedCollege);
  }, [selectedCollege]);

  const handleApply = async (driveId, companyName) => {
    try {
      await studentAPI.applyToDrive(driveId);
      toast.success(`Successfully applied to ${companyName}!`);
      await fetchDrives(selectedCollege);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  };

  const rawList = tab === 'active' ? (drives.activeDrives || []) : (drives.pastDrives || []);

  const currentList = rawList.filter(drive => {
    const matchesSearch = !searchQuery.trim() ||
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (drive.collegeName && drive.collegeName.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (drive.eligibleBranches && drive.eligibleBranches.some(b => b.toLowerCase().includes(searchQuery.toLowerCase().trim()))) ||
      (drive.description && drive.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesCollege = (selectedCollege === 'All Colleges') ||
      !drive.collegeName ||
      drive.collegeName === 'All Colleges' ||
      drive.collegeName.toLowerCase().includes(selectedCollege.toLowerCase()) ||
      selectedCollege.toLowerCase().includes(drive.collegeName.toLowerCase());

    const matchesBranch = (selectedBranch === 'All Branches') ||
      !drive.eligibleBranches ||
      drive.eligibleBranches.length === 0 ||
      drive.eligibleBranches.includes(selectedBranch);

    return matchesSearch && matchesCollege && matchesBranch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            🏢 Verified Recruitment Drives
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Exclusive recruitment drives organized for your college and branch.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/feedback')}
          style={{
            padding: '9px 18px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--accent-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          💬 Browse Interview Experiences
        </button>
      </div>

      {/* College & Branch Selection Bar */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏛</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                Filter By Institution & Branch:
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Institution: <strong style={{ color: 'var(--accent-primary)' }}>{selectedCollege}</strong> · Branch: <strong style={{ color: 'var(--accent-primary)' }}>{selectedBranch}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                Select College / University
              </label>
              <select
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                value={selectedCollege}
                onChange={e => setSelectedCollege(e.target.value)}
              >
                {POPULAR_COLLEGES.map(c => (
                  <option key={c} value={c}>
                    {c === 'All Colleges' ? '🌐 All Colleges / Open Drives' : `🏛 ${c}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                Select Branch / Department
              </label>
              <select
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
              >
                {BRANCH_OPTIONS.map(b => (
                  <option key={b} value={b}>
                    {b === 'All Branches' ? '🎓 All Branches' : `📚 ${b}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                Search Company or Branch
              </label>
              <input
                type="text"
                placeholder="🔍 Search company or branch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: 'active', label: `🟢 Active & Ongoing Drives (${drives.activeDrives?.length || 0})` },
          { value: 'past',   label: `📁 Past & Completed Drives (${drives.pastDrives?.length || 0})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <LoadingPage text="Loading verified recruitment drives..." />
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? '🏢' : '📁'}
          title={tab === 'active' ? 'No active recruitment drives found' : 'No past drives found'}
          description={
            selectedCollege !== 'All Colleges'
              ? `No recruitment drives currently listed for ${selectedCollege}. Try selecting 'All Colleges' to view all available drives.`
              : 'New placement opportunities will appear here when posted by coordinators.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {currentList.map(drive => (
            <DriveCard
              key={drive._id}
              drive={drive}
              isPast={tab === 'past'}
              onView={() => setSelected(drive)}
              onApply={() => handleApply(drive._id, drive.companyName)}
              onFeedback={() => setFeedbackDrive(drive)}
            />
          ))}
        </div>
      )}

      {/* Drive Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.companyName || 'Drive Details'}
        width="640px"
      >
        {selected && <DriveDetail drive={selected} />}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        open={!!feedbackDrive}
        onClose={() => setFeedbackDrive(null)}
        title={`Interview Experience — ${feedbackDrive?.companyName}`}
        width="600px"
      >
        {feedbackDrive && (
          <FeedbackForm
            drive={feedbackDrive}
            onSuccess={() => {
              setFeedbackDrive(null);
              toast.success('Feedback submitted anonymously!');
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function DriveCard({ drive, isPast, onView, onApply, onFeedback }) {
  const meta = STATUS_META[drive.overallStatus] || {};
  const isSelected = drive.overallStatus === 'selected';

  const extendedDeadline = getExtendedDeadline(drive.registrationDeadline);
  const isDeadlinePassed = extendedDeadline && extendedDeadline < new Date();

  return (
    <Card
      style={{
        border: isSelected ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid var(--border)',
        background: isSelected ? 'rgba(52, 211, 153, 0.04)' : 'var(--bg-card)',
        transition: 'var(--transition)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
              {isSelected && '🏆 '}
              {drive.companyName}
            </h3>

            {/* College Badge */}
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🏛 {drive.collegeName || 'All Colleges'}
            </span>

            {drive.overallStatus && (
              <Badge variant={meta.variant || 'default'} size="sm">
                {meta.icon} {meta.label}
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {drive.minPackage && (
              <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                💰 {drive.minPackage}–{drive.maxPackage} LPA
              </span>
            )}

            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              🎓 CGPA ≥ {drive.cgpaCutOff}
            </span>

            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              📋 Max Backlogs: {drive.backlogsAllowed}
            </span>

            {extendedDeadline && (
              <span
                style={{
                  fontSize: '12px',
                  color: isDeadlinePassed ? 'var(--accent-red)' : 'var(--accent-orange)',
                  fontWeight: 600,
                }}
              >
                ⏰ {isDeadlinePassed
                  ? 'Deadline passed'
                  : `Apply Till ${extendedDeadline.toLocaleDateString()}`
                }
              </span>
            )}
          </div>

          {drive.roundStatuses?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {drive.roundStatuses.map((rs, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background:
                      rs.status === 'qualified'
                        ? 'rgba(52, 211, 153, 0.12)'
                        : rs.status === 'not_qualified' || rs.status === 'not_attended'
                        ? 'rgba(248, 113, 113, 0.12)'
                        : 'rgba(56, 189, 248, 0.12)',
                    color:
                      rs.status === 'qualified'
                        ? 'var(--accent-green)'
                        : rs.status === 'not_qualified' || rs.status === 'not_attended'
                        ? 'var(--accent-red)'
                        : 'var(--accent-primary)',
                    border: '1px solid currentColor',
                    fontWeight: 600,
                  }}
                >
                  R{rs.roundNumber}: {rs.status.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {isPast && drive.visibilityReason && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              ℹ️ {drive.visibilityReason}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
          <button
            onClick={onView}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            View Details
          </button>

          {!isPast && canApplyNow(drive) && (
            <button
              onClick={onApply}
              style={{
                padding: '8px 18px',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.25)',
              }}
            >
              Apply Now →
            </button>
          )}

          {isPast && drive.feedbackPending && (
            <button
              onClick={onFeedback}
              style={{
                padding: '8px 16px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                color: 'var(--accent-orange)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              ✍️ Give Feedback
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function DriveDetail({ drive }) {
  const extendedDeadline = getExtendedDeadline(drive.registrationDeadline);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          ['Company', drive.companyName],
          ['College Institution', drive.collegeName || 'All Colleges'],
          ['Package (CTC)', drive.minPackage ? `${drive.minPackage}–${drive.maxPackage} LPA` : 'Not Specified'],
          ['CGPA Cut-off', drive.cgpaCutOff],
          ['Backlogs Allowed', drive.backlogsAllowed],
          ['Eligible Batches', (drive.eligibleBatches || []).join(', ')],
          ['Eligible Branches', (drive.eligibleBranches || []).join(', ')],
          ['Status', drive.status?.toUpperCase()],
          ['Registration Deadline', extendedDeadline ? extendedDeadline.toLocaleDateString() : 'Open'],
          ['Registration Link', drive.registrationLink || 'Direct Portal Apply'],
        ].map(([label, value]) => (
          <div key={label} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              {label}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {drive.description && (
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
            Job Description & Overview
          </h4>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {drive.description}
          </p>
        </div>
      )}

      {drive.rounds?.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            Selection Rounds & Timeline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drive.rounds.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {r.roundNumber}
                </div>

                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>
                    {r.roundName}
                  </p>
                  {r.venue && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📍 Venue: {r.venue}
                    </p>
                  )}
                  {r.date && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📅 Date: {new Date(r.date).toLocaleDateString()}
                    </p>
                  )}
                  {r.description && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {r.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackForm({ drive, onSuccess }) {
  const [form, setForm] = useState({
    role: '',
    outcome: 'selected',
    rounds: [{ roundName: 'Round 1: Technical / Online Test', description: '', challenges: '' }],
  });

  const [loading, setLoading] = useState(false);

  const addRound = () =>
    setForm(f => ({
      ...f,
      rounds: [...f.rounds, { roundName: `Round ${f.rounds.length + 1}: `, description: '', challenges: '' }],
    }));

  const removeRound = (i) =>
    setForm(f => ({
      ...f,
      rounds: f.rounds.filter((_, idx) => idx !== i),
    }));

  const updateRound = (i, field, value) =>
    setForm(f => {
      const rounds = [...f.rounds];
      rounds[i] = { ...rounds[i], [field]: value };
      return { ...f, rounds };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await feedbackAPI.submit({
        driveId: drive._id,
        driveType: 'on-campus',
        companyName: drive.companyName,
        role: form.role,
        outcome: form.outcome,
        rounds: form.rounds,
      });

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '9px 12px',
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert type="info">
        🔒 Your feedback is completely anonymous — your identity is never stored in reviews.
      </Alert>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
            Role Applied For
          </label>
          <input
            style={inputStyle}
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            placeholder="e.g. Systems Engineer, SDE"
          />
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
            Outcome
          </label>
          <select
            style={inputStyle}
            value={form.outcome}
            onChange={e => setForm({ ...form, outcome: e.target.value })}
          >
            <option value="selected">🏆 Selected</option>
            <option value="rejected">❌ Rejected / Not Shortlisted</option>
            <option value="in_progress">⚡ In Progress</option>
          </select>
        </div>
      </div>

      {form.rounds.map((round, i) => (
        <div
          key={i}
          style={{
            padding: '14px',
            background: 'var(--bg-elevated)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              Round {i + 1}
            </span>

            {i > 0 && (
              <button
                type="button"
                onClick={() => removeRound(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              style={inputStyle}
              placeholder="Round Name (e.g. Technical Interview)"
              value={round.roundName}
              onChange={e => updateRound(i, 'roundName', e.target.value)}
            />

            <textarea
              style={{ ...inputStyle, minHeight: '65px', resize: 'vertical' }}
              placeholder="What questions or topics were asked in this round?"
              value={round.description}
              onChange={e => updateRound(i, 'description', e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder="Challenges faced or tips for future candidates (optional)"
              value={round.challenges}
              onChange={e => updateRound(i, 'challenges', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRound}
        style={{
          padding: '8px',
          background: 'var(--bg-elevated)',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        + Add Another Round
      </button>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px',
          background: 'var(--accent-primary)',
          color: 'var(--bg-primary)',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {loading ? 'Submitting...' : '🚀 Submit Anonymous Experience'}
      </button>
    </form>
  );
}
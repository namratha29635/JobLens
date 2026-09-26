import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coordinatorAPI, onCampusAPI } from '../../services/api';
import { Card, Badge, Table, Tr, Td, LoadingPage, EmptyState, Tabs, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
const BATCHES = [2026, 2027, 2028, 2029];

const EMAIL_TEMPLATES = [
  {
    id: 'announcement',
    title: '📣 Drive Announcement',
    subject: 'Placement Drive Announcement: [Company Name] — Eligibility & Registration',
    message: `Dear Students,\n\nWe are pleased to announce that [Company Name] will be conducting a recruitment drive for eligible candidates.\n\nKey Details:\n• Company: [Company Name]\n• Role: Graduate Trainee / Software Engineer\n• Package: [Package in LPA]\n• Eligibility: B.Tech in CSE/IT/ECE with CGPA >= 6.5\n• Last Date to Register: [Date]\n\nPlease log in to JobLens and submit your application with an updated resume before the deadline.\n\nBest regards,\nJobLens Career Development & Recruitment Team`,
  },
  {
    id: 'shortlist',
    title: '🎯 Round Shortlist Invite',
    subject: 'Shortlist Announcement: Round 2 Technical Interview — [Company Name]',
    message: `Dear Candidates,\n\nCongratulations! You have successfully cleared the preliminary assessment and have been shortlisted for Round 2 (Technical Interview) of [Company Name].\n\nInterview Schedule:\n• Date: Tomorrow\n• Time: 10:00 AM onwards\n• Venue / Meeting Link: Placement Seminar Hall / Online via MS Teams\n\nPlease ensure your formal dress code and keep two copies of your resume along with your college ID card.\n\nBest regards,\nPlacement Coordinator`,
  },
  {
    id: 'congrats',
    title: '🏆 Offer / Selection Congratulations',
    subject: 'Congratulations! Official Selection & Offer Letter — [Company Name]',
    message: `Dear Student,\n\nHeartiest congratulations on your selection in [Company Name] during the recent recruitment drive!\n\nYour hard work, technical competence, and interview performance have yielded a great result. Further onboarding instructions and official offer letters will be shared via your registered email.\n\nWe wish you a wonderful and prosperous professional career ahead.\n\nWarm regards,\nTraining & Placement Cell`,
  },
  {
    id: 'resume_reminder',
    title: '⚠️ Resume Update Reminder',
    subject: 'Action Required: Update Your Resume on JobLens for Upcoming Placement Drives',
    message: `Dear Students,\n\nSeveral leading recruiters are scheduled to conduct recruitment drives this month. To ensure your profile is accurately matched and eligible, please verify that your latest resume (PDF) and technical skills are updated on your JobLens profile.\n\nStudents without an active resume will not be shortlisted for drive registrations.\n\nRegards,\nPlacement Cell`,
  },
];

// ── Notify Page ──────
export function NotifyPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialDrive = searchParams.get('driveId') || '';
  const initialStatus = searchParams.get('status') || '';

  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history' | 'realtime'
  const [drives, setDrives] = useState([]);
  const [targetType, setTargetType] = useState(initialEmail ? 'custom' : initialDrive ? 'drive' : 'batch');

  const [form, setForm] = useState({
    subject: '',
    message: '',
    batch: '',
    branch: '',
    driveId: initialDrive || '',
    applicationStatus: initialStatus || '',
    customEmails: initialEmail ? [initialEmail] : [],
  });

  const [customEmailInput, setCustomEmailInput] = useState(initialEmail);
  const [audienceCount, setAudienceCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);
  const [liveDispatchLog, setLiveDispatchLog] = useState([
    { id: 1, type: 'info', text: 'Real-time SMTP Engine initialized and listening', time: 'Just now' },
    { id: 2, type: 'success', text: 'In-app student notification bell sync is active', time: '1m ago' },
  ]);

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch drives for dropdown
  useEffect(() => {
    const loadDrives = async () => {
      try {
        const res = await onCampusAPI.getAll({ limit: 100 });
        setDrives(res.data.data.drives || []);
      } catch {
        // silent
      }
    };
    loadDrives();
  }, []);

  // Fetch estimated audience count
  useEffect(() => {
    const fetchCount = async () => {
      if (targetType === 'custom') {
        setAudienceCount(customEmailInput.split(',').map(e => e.trim()).filter(Boolean).length);
        return;
      }

      setLoadingCount(true);
      try {
        const params = {};
        if (targetType === 'drive' && form.driveId) {
          params.driveId = form.driveId;
          if (form.applicationStatus) params.applicationStatus = form.applicationStatus;
        } else if (targetType === 'batch') {
          if (form.batch) params.batch = form.batch;
          if (form.branch) params.branch = form.branch;
        }

        const res = await coordinatorAPI.getAudienceCount(params);
        setAudienceCount(res.data.data.count);
      } catch {
        setAudienceCount(null);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchCount();
  }, [targetType, form.batch, form.branch, form.driveId, form.applicationStatus, customEmailInput]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await coordinatorAPI.getNotificationHistory();
      setHistory(res.data.data.notifications || []);
    } catch {
      toast.error('Failed to load notification history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const applyTemplate = (tmpl) => {
    let sub = tmpl.subject;
    let msg = tmpl.message;

    if (form.driveId) {
      const d = drives.find(x => x._id === form.driveId);
      if (d) {
        sub = sub.replace(/\[Company Name\]/g, d.companyName);
        msg = msg.replace(/\[Company Name\]/g, d.companyName);
        if (d.minPackage) msg = msg.replace(/\[Package in LPA\]/g, `${d.minPackage} - ${d.maxPackage} LPA`);
      }
    }

    setForm({ ...form, subject: sub, message: msg });
    toast.success(`Applied template: ${tmpl.title}`);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error('Subject and message are required');
    }

    const payload = {
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (targetType === 'custom') {
      const parsed = customEmailInput.split(',').map(e => e.trim()).filter(Boolean);
      if (!parsed.length) return toast.error('Please enter at least one valid email address');
      payload.customEmails = parsed;
    } else if (targetType === 'drive') {
      if (!form.driveId) return toast.error('Please select a placement drive');
      payload.driveId = form.driveId;
      if (form.applicationStatus) payload.applicationStatus = form.applicationStatus;
    } else {
      if (form.batch) payload.batch = form.batch;
      if (form.branch) payload.branch = form.branch;
    }

    setLoading(true);
    try {
      const res = await coordinatorAPI.sendNotification(payload);
      const recipientCount = res.data.data.recipientCount;
      setSent(recipientCount);
      toast.success(`Real-time email notification broadcast to ${recipientCount} students!`, { duration: 5000 });
      
      setLiveDispatchLog(prev => [
        {
          id: Date.now(),
          type: 'success',
          text: `Broadcast "${payload.subject.slice(0, 30)}..." delivered to ${recipientCount} recipients`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setForm({
        subject: '',
        message: '',
        batch: '',
        branch: '',
        driveId: '',
        applicationStatus: '',
        customEmails: [],
      });
      setCustomEmailInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestBroadcast = async () => {
    setLoading(true);
    try {
      await coordinatorAPI.sendNotification({
        subject: '⚡ [TEST ALERT] Real-Time Notification Pipeline Verified',
        message: 'This is a test notification from the Placement Coordinator verifying real-time email dispatching and in-app instant alert channels.',
        batch: '2026',
      });
      toast.success('Live test notification sent successfully!');
      setLiveDispatchLog(prev => [
        {
          id: Date.now(),
          type: 'success',
          text: '⚡ Instant test broadcast verified via SMTP & Bell socket',
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (e) {
      toast.error('Test notification failed');
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
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            📢 Real-Time Email Notification Dispatcher
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Broadcast real-time emails, assessment links, and interview shortlists to students with instant delivery tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleSendTestBroadcast}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid var(--border)',
              color: 'var(--brand)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            ⚡ Test Real-Time Dispatch
          </button>
        </div>
      </div>

      {/* Real-time System Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🟢
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SMTP Engine</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Live & Ready</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🔔
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>In-App Sync</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Instant Bell Alerts</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Audience Target</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {loadingCount ? 'Counting...' : `${audienceCount ?? 'All'} Eligible Students`}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: 'compose', label: '✉️ Compose & Broadcast Email' },
          { value: 'history', label: '📜 Broadcast History & Logs' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Sent Confirmation Banner */}
      {sent && (
        <div style={{ padding: '16px 20px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.3)', borderRadius: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>✅</span>
          <div>
            <strong>Broadcast Dispatched in Real Time!</strong> Email notification successfully delivered to <strong>{sent}</strong> student recipients.
          </div>
        </div>
      )}

      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '24px', alignItems: 'flex-start' }}>
          {/* Main Compose Form */}
          <Card>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Target Type Selector */}
              <div>
                <label style={labelStyle}>Target Recipient Audience</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {[
                    { id: 'batch', label: '🎓 Batch / Branch Filter' },
                    { id: 'drive', label: '🏢 Specific Drive Applicants' },
                    { id: 'custom', label: '✉️ Direct Student Emails' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetType(t.id)}
                      style={{
                        padding: '8px 14px',
                        background: targetType === t.id ? 'var(--brand)' : 'var(--bg-elevated)',
                        color: targetType === t.id ? '#ffffff' : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: targetType === t.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Audience Option 1: Batch & Branch */}
                {targetType === 'batch' && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BATCH</label>
                      <select style={inputStyle} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
                        <option value="">All Batches</option>
                        {BATCHES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BRANCH</label>
                      <select style={inputStyle} value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                        <option value="">All Branches</option>
                        {BRANCHES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Audience Option 2: Drive Applicants */}
                {targetType === 'drive' && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1.5, minWidth: '180px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>RECRUITMENT DRIVE *</label>
                      <select
                        style={inputStyle}
                        value={form.driveId}
                        onChange={(e) => setForm({ ...form, driveId: e.target.value })}
                        required
                      >
                        <option value="">-- Select Drive --</option>
                        {drives.map((d) => (
                          <option key={d._id} value={d._id}>{d.companyName} ({d.status})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>APPLICANT STATUS</label>
                      <select
                        style={inputStyle}
                        value={form.applicationStatus}
                        onChange={(e) => setForm({ ...form, applicationStatus: e.target.value })}
                      >
                        <option value="">All Registered Applicants</option>
                        <option value="registered">Only Registered (Round 1)</option>
                        <option value="shortlisted">Shortlisted for Next Round</option>
                        <option value="selected">Selected / Placed</option>
                        <option value="rejected">Rejected Candidates</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Audience Option 3: Custom Email List */}
                {targetType === 'custom' && (
                  <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>STUDENT COLLEGE EMAILS (Comma-separated)</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. 2100030001@college.edu, student2@college.edu"
                      value={customEmailInput}
                      onChange={(e) => setCustomEmailInput(e.target.value)}
                    />
                  </div>
                )}

                {/* Recipient Counter Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Estimated Recipients:</span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(37, 99, 235, 0.08)',
                      border: '1px solid rgba(37, 99, 235, 0.25)',
                      color: 'var(--brand)',
                    }}
                  >
                    {loadingCount ? 'Counting...' : `👥 ${audienceCount ?? 'All'} Students`}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Email Subject *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. TCS Placement Drive — Round 2 Technical Interview Schedule"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label style={labelStyle}>Email Body Content *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '220px', resize: 'vertical', lineHeight: 1.5 }}
                  placeholder="Compose official notification message or choose from templates on the right..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--brand), #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                }}
              >
                {loading ? (
                  <>
                    <Spinner size={16} color="#ffffff" />
                    Broadcasting Real-Time Emails...
                  </>
                ) : (
                  <>📢 Broadcast Notification ({audienceCount ?? 'Targeted'} Recipients) →</>
                )}
              </button>
            </form>
          </Card>

          {/* Right Column: Templates & Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Templates Card */}
            <Card>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                📋 Pre-Built Official Email Templates
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Click to autofill structured placement communications:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <span>{tmpl.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 700 }}>Apply →</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Live Email Preview */}
            <Card>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                👁️ Live Email Dispatch Preview
              </h3>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FROM: Placement Cell &lt;placements@college.edu&gt;</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    TO: {targetType === 'custom' ? customEmailInput || 'Specified Students' : `${audienceCount ?? 'Targeted'} Students`}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    Subject: {form.subject || '(Subject line preview)'}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto' }}>
                  {form.message || 'Email message preview will appear here as you type or pick a template...'}
                </div>
              </div>
            </Card>

            {/* Real-time Dispatch Activity Feed */}
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
                ⚡ Real-Time Dispatch Activity Feed
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {liveDispatchLog.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.text}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Broadcast History Tab */}
      {activeTab === 'history' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loadingHistory ? (
            <LoadingPage text="Loading broadcast logs..." />
          ) : history.length === 0 ? (
            <EmptyState
              icon="📜"
              title="No Broadcasts Found"
              description="Previously sent notification emails will be logged here in real time."
            />
          ) : (
            <Table headers={['Subject', 'Recipients', 'Filter Details', 'Sender', 'Timestamp']}>
              {history.map((h) => (
                <Tr key={h._id}>
                  <Td>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {h.details?.subject || 'Notification'}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant="primary" size="sm">
                      👥 {h.details?.recipientCount || 0} Students
                    </Badge>
                  </Td>
                  <Td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Batch: {h.details?.batch || 'All'} · Branch: {h.details?.branch || 'All'}
                      {h.details?.statusFilter && ` · Status: ${h.details.statusFilter}`}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {h.user?.email || 'Coordinator'}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Audit Logs Page ───────
export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const ACTION_COLORS = {
    DRIVE_CREATED: 'primary',
    DRIVE_UPDATED: 'warning',
    DRIVE_DELETED: 'danger',
    ROUND_CREATED: 'purple',
    ROUND_UPDATED: 'warning',
    ELIGIBLE_LIST_UPLOADED: 'primary',
    ATTENDED_LIST_UPLOADED: 'warning',
    RESULTS_PUBLISHED: 'success',
    NOTIFICATION_SENT: 'default',
    APPLICATION_STATUS_UPDATED: 'purple',
    BULK_APPLICATIONS_UPDATED: 'purple',
  };

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      const res = await coordinatorAPI.getAuditLogs(params);
      setLogs(res.data.data.logs);
      setTotal(res.data.data.pagination.total);
      setPage(p);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(1); }, [actionFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Audit Logs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>All coordinator actions — {total} entries</p>
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', padding: '8px 14px', fontSize: '13px' }}
        >
          <option value="">All Actions</option>
          {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <LoadingPage text="Loading logs..." /> : logs.length === 0 ? (
          <EmptyState icon="📋" title="No audit logs" description="Actions will appear here" />
        ) : (
          <>
            <Table headers={['Action', 'Entity', 'Details', 'By', 'Time']}>
              {logs.map(log => (
                <Tr key={log._id}>
                  <Td><Badge variant={ACTION_COLORS[log.action] || 'default'} size="sm">{log.action}</Badge></Td>
                  <Td><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.entity}</span></Td>
                  <Td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.details ? Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ') : '—'}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.user?.email || 'System'}</span></Td>
                  <Td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span></Td>
                </Tr>
              ))}
            </Table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Page {page} of {Math.ceil(total / 20) || 1}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={page <= 1} onClick={() => fetchLogs(page - 1)} style={{ padding: '6px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button>
                <button disabled={page >= Math.ceil(total / 20)} onClick={() => fetchLogs(page + 1)} style={{ padding: '6px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page >= Math.ceil(total / 20) ? 0.5 : 1 }}>Next →</button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
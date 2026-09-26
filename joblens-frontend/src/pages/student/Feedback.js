import React, { useEffect, useRef, useState } from 'react';
import { feedbackAPI } from '../../services/api';
import { Card, Badge, Modal, LoadingPage, EmptyState, Alert, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFB, setLoadingFB] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Submitting Feedback
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    driveType: 'on-campus',
    outcome: 'selected',
    rounds: [
      { roundName: 'Round 1: Online Assessment / Technical Test', description: '', challenges: '' },
      { roundName: 'Round 2: Technical Interview', description: '', challenges: '' },
    ],
  });

  const feedbackRef = useRef(null);

  const loadCompanies = async () => {
    try {
      const res = await feedbackAPI.getCompanies();
      const list = res.data?.data || [];
      setCompanies(list);
      if (list.length > 0 && !selected) {
        loadFeedback(list[0].companyName);
      }
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadFeedback = async (companyName) => {
    setSelected(companyName);
    setLoadingFB(true);

    setTimeout(() => {
      if (window.innerWidth <= 768) {
        feedbackRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 150);

    try {
      const res = await feedbackAPI.getByCompany(companyName);
      setFeedbacks(res.data?.data?.feedbacks || []);
    } catch {
      toast.error('Failed to load feedback details');
    } finally {
      setLoadingFB(false);
    }
  };

  const handleAddRound = () => {
    setForm(prev => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        { roundName: `Round ${prev.rounds.length + 1}: `, description: '', challenges: '' },
      ],
    }));
  };

  const handleRemoveRound = (idx) => {
    setForm(prev => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== idx),
    }));
  };

  const handleRoundChange = (idx, field, value) => {
    setForm(prev => {
      const updated = [...prev.rounds];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, rounds: updated };
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      return toast.error('Please enter the company name');
    }

    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        companyName: form.companyName.trim(),
        role: form.role.trim() || 'Software Engineer',
        driveType: form.driveType,
        outcome: form.outcome,
        rounds: form.rounds,
      });

      toast.success('Your interview experience has been submitted anonymously! 🎉');
      setShowModal(false);
      setForm({
        companyName: '',
        role: '',
        driveType: 'on-campus',
        outcome: 'selected',
        rounds: [
          { roundName: 'Round 1: Online Assessment / Technical Test', description: '', challenges: '' },
          { roundName: 'Round 2: Technical Interview', description: '', challenges: '' },
        ],
      });

      // Refresh list
      const targetCompany = form.companyName.trim();
      await loadCompanies();
      loadFeedback(targetCompany);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            💬 Company Interview Experiences & Feedback
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Anonymous interview rounds, questions & insights shared by fellow students and seniors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            background: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
          }}
        >
          ➕ Share Interview Experience
        </button>
      </div>

      {loading ? (
        <LoadingPage />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left Column: Companies List & Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Companies ({filteredCompanies.length})
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredCompanies.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {companies.length === 0 ? 'No feedback shared yet.' : 'No matching companies found.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    style={{
                      padding: '7px 14px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '6px',
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Share First Review
                  </button>
                </div>
              ) : (
                filteredCompanies.map(c => (
                  <button
                    key={c.companyName}
                    onClick={() => loadFeedback(c.companyName)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: selected?.toLowerCase() === c.companyName.toLowerCase() ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                      border: `1px solid ${selected?.toLowerCase() === c.companyName.toLowerCase() ? 'rgba(56, 189, 248, 0.35)' : 'var(--border)'}`,
                      color: selected?.toLowerCase() === c.companyName.toLowerCase() ? 'var(--accent-primary)' : 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'var(--transition)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: selected?.toLowerCase() === c.companyName.toLowerCase() ? 700 : 500 }}>
                      🏢 {c.companyName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '12px' }}>
                      {c.count} review{c.count !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Feedbacks for Selected Company */}
          <div ref={feedbackRef}>
            {!selected ? (
              <EmptyState
                icon="💬"
                title="Select a company"
                description="Click on any company from the left panel or click 'Share Interview Experience' to add one."
              />
            ) : loadingFB ? (
              <LoadingPage text={`Loading reviews for ${selected}...`} />
            ) : feedbacks.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '6px' }}>No reviews yet for {selected}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
                  Be the first student to share your interview rounds, questions, and insights!
                </p>
                <button
                  onClick={() => {
                    setForm(prev => ({ ...prev, companyName: selected }));
                    setShowModal(true);
                  }}
                  style={{
                    padding: '8px 18px',
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ✍️ Add Review for {selected}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
                      🏢 {selected}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {feedbacks.length} anonymous candidate experience{feedbacks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setForm(prev => ({ ...prev, companyName: selected }));
                      setShowModal(true);
                    }}
                    style={{
                      padding: '7px 14px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '8px',
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Experience
                  </button>
                </div>

                {feedbacks.map((fb, i) => (
                  <Card key={fb._id || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {fb.role || 'Software Engineering Candidate'}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            🎓 Batch of {fb.passedOutYear || '2026'}
                          </span>
                          {fb.driveRef?.driveType && (
                            <Badge variant="default" size="sm">
                              {fb.driveRef.driveType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {fb.outcome && (
                          <Badge variant={fb.outcome === 'selected' ? 'success' : fb.outcome === 'rejected' ? 'danger' : 'primary'} size="sm">
                            {fb.outcome === 'selected' ? '🏆 Selected' : fb.outcome === 'rejected' ? '❌ Not Selected' : '⚡ In Progress'}
                          </Badge>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {fb.rounds?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {fb.rounds.map((round, ri) => (
                          <div key={ri} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                              🔹 {round.roundName}
                            </p>

                            {round.description && (
                              <div style={{ marginBottom: '8px' }}>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 700, textTransform: 'uppercase' }}>
                                  Questions Asked & Topics Covered
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                  {round.description}
                                </p>
                              </div>
                            )}

                            {round.challenges && (
                              <div style={{ padding: '8px 12px', background: 'rgba(234, 179, 8, 0.08)', borderLeft: '3px solid var(--accent-orange)', borderRadius: '4px' }}>
                                <p style={{ fontSize: '10px', color: 'var(--accent-orange)', marginBottom: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
                                  💡 Key Challenges & Preparation Advice
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {round.challenges}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No detailed round breakdown provided.</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Interview Experience Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="✍️ Share Anonymous Interview Experience"
        width="650px"
      >
        <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert type="info">
            🔒 Your submission is 100% anonymous. Your name and roll number are never displayed or stored in public reviews.
          </Alert>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Company Name *
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. Google, TCS, Amazon, Infosys"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Role Applied For
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. SDE-1, Full Stack Dev"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Drive Type
              </label>
              <select
                style={inputStyle}
                value={form.driveType}
                onChange={e => setForm({ ...form, driveType: e.target.value })}
              >
                <option value="on-campus">🏢 On-Campus Placement</option>
                <option value="off-campus">🌐 Off-Campus / Career Portal</option>
                <option value="internship">💼 Internship / PPO</option>
                <option value="referral">🤝 Employee Referral</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Interview Outcome
              </label>
              <select
                style={inputStyle}
                value={form.outcome}
                onChange={e => setForm({ ...form, outcome: e.target.value })}
              >
                <option value="selected">🏆 Selected / Received Offer</option>
                <option value="rejected">❌ Not Selected / Eliminated</option>
                <option value="in_progress">⚡ Ongoing / Awaiting Result</option>
              </select>
            </div>
          </div>

          {/* Interview Rounds */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Interview Rounds ({form.rounds.length})
              </label>
              <button
                type="button"
                onClick={handleAddRound}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Another Round
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {form.rounds.map((round, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                      style={{ ...inputStyle, fontWeight: 600, color: 'var(--accent-primary)' }}
                      placeholder="Round Title (e.g. Round 1: Coding Test)"
                      value={round.roundName}
                      onChange={e => handleRoundChange(idx, 'roundName', e.target.value)}
                    />
                    {form.rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-red)',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                        title="Remove round"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <textarea
                    style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    placeholder="Questions asked, topics covered, difficulty level..."
                    value={round.description}
                    onChange={e => handleRoundChange(idx, 'description', e.target.value)}
                  />

                  <input
                    style={inputStyle}
                    placeholder="Tips or challenges faced in this round (optional)"
                    value={round.challenges}
                    onChange={e => handleRoundChange(idx, 'challenges', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 18px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 22px',
                background: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {submitting && <Spinner size={14} color="var(--bg-primary)" />}
              🚀 Submit Experience
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
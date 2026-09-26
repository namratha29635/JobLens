import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

const LIVE_EVENTS = [
  {
    icon: <Zap size={15} style={{ color: '#f59e0b' }} />,
    tag: 'Live Hiring Drive',
    title: 'Goldman Sachs Off-Campus Drive (24 LPA)',
    desc: 'Verified by Placement Coordinator · 142 Applications active',
  },
  {
    icon: <ShieldCheck size={15} style={{ color: '#10b981' }} />,
    tag: 'Scam Shield Active',
    title: 'Blocked 2 Unverified External Postings',
    desc: 'Registration fee requirement detected & blacklisted',
  },
  {
    icon: <Sparkles size={15} style={{ color: '#06b6d4' }} />,
    tag: 'AI Match Engine',
    title: 'High Fit Score (96%) for React Developers',
    desc: 'Real-time keyword matching across active job descriptions',
  },
  {
    icon: <CheckCircle2 size={15} style={{ color: '#4f46e5' }} />,
    tag: 'Application Status',
    title: 'Round 2 Technical Shortlist Published',
    desc: 'Students notified instantly with round schedule and prep links',
  },
];

export default function LiveActivityPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
        setVisible(true);
      }, 400);
    }, 5500);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return null;

  const current = LIVE_EVENTS[currentIndex];

  return (
    <div
      className="live-activity-popup"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 90,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-floating)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: 'var(--brand-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {current.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--brand)',
            }}
          >
            {current.tag}
          </span>
        </div>

        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {current.title}
        </div>

        <div
          style={{
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            marginTop: '2px',
            lineHeight: 1.4,
          }}
        >
          {current.desc}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Placement Dashboard';
    if (path.includes('/drives')) return 'Job Placement Drives';
    if (path.includes('/offcampus')) return 'Off-Campus Opportunities';
    if (path.includes('/students')) return 'Student Master Directory';
    if (path.includes('/notifications') || path.includes('/notify')) return 'Real-Time Email & Announcements';
    if (path.includes('/profile')) return 'Student Profile & Resume';
    if (path.includes('/verifier')) return 'Job Scam & Risk Verifier';
    if (path.includes('/ai')) return 'AI Resume Matcher & Tools';
    return 'JobLens Placement Portal';
  };

  return (
    <>
      <div className="mobile-not-supported">
        Not visible in this mode
        <br />
        Please use screen width above 360px
      </div>

      <div className="app-shell">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="app-content">
          {/* Topbar Header */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 28px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 90,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {getPageTitle()}
              </h2>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  background: 'rgba(37, 99, 235, 0.08)',
                  color: 'var(--brand)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  display: 'none',
                  '@media (min-width: 640px)': { display: 'inline-block' },
                }}
                className="desktop-only"
              >
                {user?.role === 'coordinator' ? '🏛️ Placement Cell' : '🎓 Student Portal'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* If student, show in-app Notification Bell */}
              {user?.role === 'student' && <NotificationBell />}

              {/* If coordinator, quick notify shortcut button */}
              {user?.role === 'coordinator' && (
                <button
                  onClick={() => navigate('/coordinator/notify')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.25)',
                    color: 'var(--brand)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📢 Broadcast Alert
                </button>
              )}

              {/* User profile capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          </header>

          <div className="app-page">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
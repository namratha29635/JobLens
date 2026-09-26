import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  Bookmark,
  User,
  Users,
  BarChart3,
  Send,
} from 'lucide-react';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Job Dashboard';
    if (path.includes('/drives')) return 'Job Drives';
    if (path.includes('/offcampus')) return 'Off-Campus Opportunities';
    if (path.includes('/students')) return 'Student Master Directory';
    if (path.includes('/notifications') || path.includes('/notify')) return 'Real-Time Announcements';
    if (path.includes('/profile')) return 'Student Profile & Resume';
    if (path.includes('/verifier')) return 'Job Scam & Risk Verifier';
    if (path.includes('/ai')) return 'AI Resume Matcher & Tools';
    return 'JobLens Off-Campus Portal';
  };

  const isCoordinator = user?.role === 'coordinator';

  // Bottom tabs for mobile phone app experience
  const studentBottomTabs = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/browse', icon: Briefcase, label: 'Browse' },
    { path: '/student/verifier', icon: ShieldCheck, label: 'Verifier' },
    { path: '/student/saved', icon: Bookmark, label: 'Saved' },
    { path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const coordinatorBottomTabs = [
    { path: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/coordinator/postings', icon: Briefcase, label: 'Postings' },
    { path: '/coordinator/verify', icon: ShieldCheck, label: 'Verify' },
    { path: '/coordinator/students', icon: Users, label: 'Students' },
    { path: '/coordinator/reports', icon: BarChart3, label: 'Reports' },
  ];

  const currentBottomTabs = isCoordinator ? coordinatorBottomTabs : studentBottomTabs;

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <div className="desktop-only" style={{ display: 'flex', zIndex: 100 }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="mobile-drawer-content">
            <Sidebar
              collapsed={false}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </>
      )}

      <main className="app-content">
        {/* Topbar Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            width: '100%',
          }}
        >
          {/* Left: Mobile hamburger or Desktop Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="mobile-only"
              onClick={() => setMobileDrawerOpen(true)}
              style={{
                background: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '7px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div>
              <h2
                style={{
                  fontSize: 'clamp(14px, 3.5vw, 17px)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                {getPageTitle()}
              </h2>
            </div>

            <span
              className="desktop-only"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--brand)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {user?.role === 'coordinator' ? '🏛️ Coordinator Hub' : '🎓 Student Portal'}
            </span>
          </div>

          {/* Right: Actions & User capsule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.role === 'student' && <NotificationBell />}

            {user?.role === 'coordinator' && (
              <button
                type="button"
                onClick={() => navigate('/coordinator/notify')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(79, 70, 229, 0.08)',
                  border: '1px solid rgba(79, 70, 229, 0.25)',
                  color: 'var(--brand)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Send size={13} />
                <span className="desktop-only">Broadcast Alert</span>
              </button>
            )}

            {/* User Capsule */}
            <div
              onClick={() => navigate(isCoordinator ? '/coordinator/settings' : '/student/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 4px',
                background: 'var(--bg-elevated)',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isCoordinator
                    ? 'linear-gradient(135deg, #172554, #4f46e5)'
                    : 'linear-gradient(135deg, #06b6d4, #4f46e5)',
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
                className="desktop-only"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  maxWidth: '120px',
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

        {/* Page Content */}
        <div className="app-page">{children}</div>

        {/* Mobile Bottom App Navigation Bar (Phone experience) */}
        <nav className="mobile-only mobile-bottom-nav">
          {currentBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              location.pathname === tab.path ||
              (tab.path !== '/student/dashboard' &&
                tab.path !== '/coordinator/dashboard' &&
                location.pathname.startsWith(tab.path));

            return (
              <button
                key={tab.path}
                type="button"
                className={`mobile-bottom-tab ${active ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                <Icon size={19} color={active ? '#4f46e5' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
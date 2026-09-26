import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  ShieldCheck,
  User,
  Bell,
  Settings,
  Users,
  Building2,
  BarChart3,
  Send,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from 'lucide-react';

export const studentNav = [
  { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/student/browse', icon: Briefcase, label: 'Browse Jobs' },
  { path: '/student/saved', icon: Bookmark, label: 'Saved Jobs' },
  { path: '/student/verifier', icon: ShieldCheck, label: 'Job Verification', badge: 'AI Verified' },
  { path: '/student/profile', icon: User, label: 'Profile' },
  { path: '/student/notifications', icon: Bell, label: 'Notifications' },
  { path: '/student/settings', icon: Settings, label: 'Settings' },
];

export const coordinatorNav = [
  { path: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/coordinator/postings', icon: Briefcase, label: 'Job Postings' },
  { path: '/coordinator/verify', icon: ShieldCheck, label: 'Verify Jobs', badge: 'Action Req' },
  { path: '/coordinator/students', icon: Users, label: 'Students' },
  { path: '/coordinator/companies', icon: Building2, label: 'Companies' },
  { path: '/coordinator/reports', icon: BarChart3, label: 'Reports & Analytics' },
  { path: '/coordinator/notify', icon: Send, label: 'Real-Time Broadcast' },
  { path: '/coordinator/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed, isMobileDrawer = false, onCloseDrawer }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCoordinator = user?.role === 'coordinator';
  const navItems = isCoordinator ? coordinatorNav : studentNav;

  const studentName = profile?.name || user?.name || (isCoordinator ? 'Coordinator Admin' : 'Demo Student');
  const studentBranch = profile?.branch ? `${profile.branch} • Batch ${profile.passedOutYear || 2026}` : 'B.Tech CSE • Batch 2026';

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobileDrawer && onCloseDrawer) {
      onCloseDrawer();
    }
  };

  const handleSignOut = () => {
    logout();
    if (isMobileDrawer && onCloseDrawer) {
      onCloseDrawer();
    }
    navigate('/login');
  };

  return (
    <aside
      className={`sidebar ${collapsed && !isMobileDrawer ? 'collapsed' : ''}`}
      style={{
        width: isMobileDrawer ? '100%' : collapsed ? '76px' : '260px',
        minHeight: isMobileDrawer ? '100%' : '100vh',
        height: isMobileDrawer ? '100%' : 'auto',
        background: '#ffffff',
        borderRight: isMobileDrawer ? 'none' : '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: isMobileDrawer ? 'relative' : 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: isMobileDrawer ? 'none' : '1px 0 6px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Logo & Portal Brand */}
        <div
          style={{
            padding: collapsed && !isMobileDrawer ? '20px 14px' : '20px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !isMobileDrawer ? 'center' : 'space-between',
          }}
        >
          {(!collapsed || isMobileDrawer) ? (
            <div
              onClick={() => handleNavClick(isCoordinator ? '/coordinator/dashboard' : '/student/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5, #172554)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span className="brand-letter-j">J</span>
                  <span className="brand-letters-rest">obLens</span>
                  <CheckCircle size={14} color="#10b981" fill="#10b981" style={{ color: '#fff' }} />
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isCoordinator ? 'Coordinator Portal' : 'Student Portal'}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShieldCheck size={20} />
            </div>
          )}

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseDrawer}
              style={{
                background: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="desktop-only"
              style={{
                background: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                padding: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav
          style={{
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              (item.path !== '/student/dashboard' &&
                item.path !== '/coordinator/dashboard' &&
                location.pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                title={collapsed && !isMobileDrawer ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed && !isMobileDrawer ? '11px 0' : '10px 14px',
                  justifyContent: collapsed && !isMobileDrawer ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  background: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={18} color={active ? '#4f46e5' : 'currentColor'} />
                {(!collapsed || isMobileDrawer) && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {(!collapsed || isMobileDrawer) && item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Section & Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        {(!collapsed || isMobileDrawer) && (
          <div
            onClick={() => handleNavClick(isCoordinator ? '/coordinator/settings' : '/student/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              marginBottom: '10px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isCoordinator
                  ? 'linear-gradient(135deg, #172554, #4f46e5)'
                  : 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {studentName?.[0]?.toUpperCase() || 'U'}
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {studentName}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {isCoordinator ? 'Coordinator Admin' : studentBranch}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed && !isMobileDrawer ? 'Sign Out' : ''}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !isMobileDrawer ? 'center' : 'flex-start',
            gap: '10px',
            padding: '10px',
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid transparent',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={16} />
          {(!collapsed || isMobileDrawer) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
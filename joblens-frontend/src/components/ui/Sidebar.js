import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
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
  ShieldAlert,
  CheckCircle,
  FileText,
  BadgeCheck,
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

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCoordinator = user?.role === 'coordinator';
  const navItems = isCoordinator ? coordinatorNav : studentNav;

  const studentName = profile?.name || user?.name || (isCoordinator ? 'Placement Admin' : 'Demo Student');
  const studentBranch = profile?.branch ? `${profile.branch} • Batch ${profile.passedOutYear || 2026}` : 'B.Tech CSE • Batch 2026';

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '76px' : '260px',
        minHeight: '100vh',
        background: '#ffffff',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '1px 0 4px rgba(0,0,0,0.02)',
      }}
    >
      <div>
        {/* Logo & Portal Brand */}
        <div
          style={{
            padding: collapsed ? '20px 14px' : '20px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed ? (
            <div
              onClick={() => navigate(isCoordinator ? '/coordinator/dashboard' : '/student/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  JobPortal
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
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShieldCheck size={20} />
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
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
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== '/student/dashboard' && item.path !== '/coordinator/dashboard' && location.pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '11px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  background: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
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
                <Icon size={18} color={active ? '#2563eb' : 'currentColor'} />
                {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {!collapsed && item.badge && (
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
        {!collapsed && (
          <div
            onClick={() => navigate(isCoordinator ? '/coordinator/settings' : '/student/profile')}
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
                background: isCoordinator ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #0284c7, #2563eb)',
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
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {isCoordinator ? 'Placement Cell Admin' : studentBranch}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Sign Out' : ''}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
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
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
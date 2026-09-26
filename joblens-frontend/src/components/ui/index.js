import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

// ── Button ───────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading,
  disabled,
  icon: Icon,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    borderRadius: '10px',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    textDecoration: 'none',
    userSelect: 'none',
    ...style,
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 18px', fontSize: '13px' },
    lg: { padding: '13px 24px', fontSize: '15px' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
    },
    secondary: {
      background: '#ffffff',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    },
    danger: {
      background: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fca5a5',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--brand)',
      border: '1px solid var(--brand)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      style={{ ...baseStyle, ...currentSize, ...currentVariant }}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      {...props}
    >
      {loading ? <Spinner size={16} color={variant === 'primary' ? '#ffffff' : 'var(--brand)'} /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};

// ── Verification Badge ───────────────────────────────────────────────
export const VerificationBadge = ({ status = 'Verified', size = 'md' }) => {
  const isVerified = status === 'Verified' || status === 'VERIFIED';
  const isPending = status === 'Pending' || status === 'PENDING' || status === 'Under Review';
  const isRejected = status === 'Rejected' || status === 'NOT_VERIFIED' || status === 'Unverified';

  const config = isVerified
    ? {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.25)',
        icon: ShieldCheck,
        label: 'Verified Job',
      }
    : isPending
    ? {
        bg: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706',
        border: 'rgba(245, 158, 11, 0.25)',
        icon: Clock,
        label: 'Under Review',
      }
    : {
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: 'rgba(239, 68, 68, 0.25)',
        icon: ShieldAlert,
        label: 'Unverified / Flagged',
      };

  const IconComp = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '4px' : '6px',
        padding: size === 'sm' ? '3px 8px' : '5px 12px',
        borderRadius: '999px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 700,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <IconComp size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
};

// ── Badge ────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const colors = {
    default: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    primary: { bg: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', border: 'rgba(37, 99, 235, 0.2)' },
    success: { bg: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
    danger: { bg: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' },
    purple: { bg: 'rgba(139, 92, 246, 0.08)', color: '#7c3aed', border: 'rgba(139, 92, 246, 0.2)' },
    teal: { bg: 'rgba(13, 148, 136, 0.08)', color: '#0d9488', border: 'rgba(13, 148, 136, 0.2)' },
  };

  const c = colors[variant] || colors.default;

  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: '999px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};

// ── Card ─────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', glow, style = {}, onClick, hoverEffect = false }) => (
  <div
    onClick={onClick}
    style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
    }}
    className={`card ${hoverEffect ? 'hover-elevate' : ''} ${className}`}
  >
    {children}
  </div>
);

// ── StatCard ─────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = '#2563eb', trend, trendLabel }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>{label}</span>
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: `${color}12`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon ? <Icon size={20} /> : <Sparkles size={20} />}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
        {value}
      </span>
      {trend && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: trend.startsWith('+') ? '#059669' : '#475569',
            background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
            padding: '2px 8px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>

    {trendLabel && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{trendLabel}</div>}
  </div>
);

// ── Job Card ─────────────────────────────────────────────────────────
export const JobCard = ({ job, onApply, onViewDetails, onClick, isSaved, onToggleSave }) => {
  const handleDetailsClick = () => {
    if (onClick) onClick(job);
    else if (onViewDetails) onViewDetails(job);
  };

  return (
    <div
      onClick={handleDetailsClick}
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '18px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        cursor: (onClick || onViewDetails) ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Header with Company Logo, Title, Verification Badge */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '6px',
                flexShrink: 0,
              }}
            >
              {job.logo ? (
                <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={24} color="#64748b" />
              )}
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {job.company}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>
                {job.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave && onToggleSave(job.id, e);
            }}
            style={{
              background: isSaved ? 'rgba(37, 99, 235, 0.1)' : '#f8fafc',
              border: `1px solid ${isSaved ? 'rgba(37, 99, 235, 0.3)' : 'var(--border)'}`,
              color: isSaved ? '#2563eb' : '#94a3b8',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title={isSaved ? 'Remove from Saved' : 'Save Job'}
          >
            <Bookmark size={16} fill={isSaved ? '#2563eb' : 'none'} />
          </button>
        </div>

        {/* Meta Info Row: Location, Salary, Experience */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '14px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} color="#0284c7" />
            {job.location}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <DollarSign size={14} color="#16a34a" />
            {job.salary || job.ctc}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Briefcase size={14} color="#8b5cf6" />
            {job.type}
          </span>
        </div>

        {/* Skills Tag Cloud */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {job.skills?.slice(0, 4).map((s, i) => (
            <Badge key={i} variant="default" size="sm">
              {s}
            </Badge>
          ))}
          {job.skills?.length > 4 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer with Verification Status & Action Buttons */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <VerificationBadge level={job.verificationLevel || (job.verified ? 'Level 3' : 'Pending')} size="sm" />

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDetailsClick();
            }}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply && onApply(job);
            }}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Modal ────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, subtitle, children, width = '680px' }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: '#ffffff',
            zIndex: 10,
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Table ────────────────────────────────────────────────────────────
export const Table = ({ headers, children, empty = 'No records found' }) => (
  <div style={{ overflowX: 'auto', width: '100%' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: '12px 18px',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {!children || (Array.isArray(children) && children.length === 0) ? (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{empty}</div>
    ) : null}
  </div>
);

export const Tr = ({ children, onClick }) => (
  <tr
    onClick={onClick}
    style={{
      borderBottom: '1px solid var(--border)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#f8fafc';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#ffffff';
    }}
  >
    {children}
  </tr>
);

export const Td = ({ children, style = {} }) => (
  <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-primary)', ...style }}>{children}</td>
);

// ── Tabs ─────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div
    style={{
      display: 'flex',
      gap: '6px',
      background: '#f1f5f9',
      borderRadius: '12px',
      padding: '4px',
      border: '1px solid var(--border)',
      overflowX: 'auto',
    }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        style={{
          padding: '8px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: active === tab.value ? 700 : 500,
          background: active === tab.value ? '#ffffff' : 'transparent',
          color: active === tab.value ? 'var(--brand)' : 'var(--text-secondary)',
          boxShadow: active === tab.value ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
        }}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// ── Spinner ──────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = 'var(--brand)' }) => (
  <div
    style={{
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }}
  />
);

// ── Empty State ──────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '440px', margin: '0 auto' }}>
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: 'rgba(37, 99, 235, 0.08)',
        color: 'var(--brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
      }}
    >
      {Icon ? <Icon size={32} /> : <Briefcase size={32} />}
    </div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
      {title}
    </h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
      {description}
    </p>
    {action}
  </div>
);

// ── Loading Page ─────────────────────────────────────────────────────
export const LoadingPage = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '16px' }}>
    <Spinner size={36} color="var(--brand)" />
    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{text}</p>
  </div>
);

// ── Alert ────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message, title, children, style = {} }) => {
  const styles = {
    info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
    danger: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
  };
  const s = styles[type] || styles.info;

  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: s.color,
        fontSize: '13px',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {title && <div style={{ fontWeight: 700, marginBottom: '4px' }}>{title}</div>}
      {message || children}
    </div>
  );
};

// ── ProgressBar ──────────────────────────────────────────────────────
export const ProgressBar = ({ progress = 0, color = 'var(--brand)', height = 8, showLabel = false }) => (
  <div style={{ width: '100%' }}>
    {showLabel && (
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    )}
    <div style={{ width: '100%', height: `${height}px`, background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          height: '100%',
          background: color,
          borderRadius: '999px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  </div>
);

// ── Input ────────────────────────────────────────────────────────────
export const Input = ({ label, error, style = {}, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </label>
    )}
    <input
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border)'}`,
        background: '#f8fafc',
        fontSize: '13px',
        outline: 'none',
        ...style,
      }}
      {...props}
    />
    {error && <span style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px', display: 'block' }}>{error}</span>}
  </div>
);

// ── Select ───────────────────────────────────────────────────────────
export const Select = ({ label, options = [], children, style = {}, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </label>
    )}
    <select
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: '#f8fafc',
        fontSize: '13px',
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      {options.length > 0
        ? options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))
        : children}
    </select>
  </div>
);

// ── Textarea ─────────────────────────────────────────────────────────
export const Textarea = ({ label, error, style = {}, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </label>
    )}
    <textarea
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border)'}`,
        background: '#f8fafc',
        fontSize: '13px',
        minHeight: '80px',
        outline: 'none',
        ...style,
      }}
      {...props}
    />
    {error && <span style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px', display: 'block' }}>{error}</span>}
  </div>
);
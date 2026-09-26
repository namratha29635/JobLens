import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import ThreeJsBackground from '../../components/ui/ThreeJsBackground';
import ThemeToggle from '../../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

export function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Min 8 characters required');
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed! Please login again.');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%',
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #f8fafc 100%)',
        color: '#0f172a',
        padding: '24px 16px',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {/* 3D Animation running beneath */}
      <ThreeJsBackground />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          animation: 'slideUp 0.35s ease',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            ← Back to Home
          </button>
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
              borderRadius: '16px',
              marginBottom: '12px',
              fontSize: '24px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.28)',
              color: '#ffffff',
            }}
          >
            🔐
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '4px',
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            <span style={{ color: '#4f46e5' }}>J</span>
            <span style={{ color: '#0f172a' }}>obLens</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '13px', fontWeight: 600 }}>
            {user?.isFirstLogin ? 'First login — please set a new password to continue.' : 'Update your account password.'}
          </p>
        </div>

        {/* Crisp White Card Box */}
        <div
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: '0 20px 45px -10px rgba(79, 70, 229, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '18px', color: '#0f172a' }}>
            Change Password
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['currentPassword', 'newPassword', 'confirm'].map((field) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  required
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.32)' }}
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch { toast.error('Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%',
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #f8fafc 100%)',
        color: '#0f172a',
        padding: '24px 16px',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {/* 3D Animation running beneath */}
      <ThreeJsBackground />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          animation: 'slideUp 0.35s ease',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            ← Back to Home
          </button>
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
              borderRadius: '16px',
              marginBottom: '12px',
              fontSize: '24px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.28)',
              color: '#ffffff',
            }}
          >
            🔑
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '4px',
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            <span style={{ color: '#4f46e5' }}>J</span>
            <span style={{ color: '#0f172a' }}>obLens</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '13px', fontWeight: 600 }}>
            Account Password Recovery
          </p>
        </div>

        {/* Crisp White Card Box */}
        <div
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: '0 20px 45px -10px rgba(79, 70, 229, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
            {step === 1 ? '📧 Forgot Password' : '🔢 Enter Verification OTP'}
          </h2>
          {step === 1 ? (
            <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                  Registered College Email
                </label>
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.32)' }}
              >
                {loading ? 'Sending...' : 'Send Recovery OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                  6-Digit OTP Code
                </label>
                <input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  placeholder="Create strong new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.32)' }}
              >
                {loading ? 'Resetting...' : 'Reset & Save Password'}
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ marginTop: '18px', background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: '13px', display: 'block', width: '100%', textAlign: 'center' }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
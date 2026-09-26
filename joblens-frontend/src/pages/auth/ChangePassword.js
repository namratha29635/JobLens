import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
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
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px', color: '#0f172a' }}>Change Password</h2>
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              {user?.isFirstLogin ? 'First login — please set a new password to continue.' : 'Update your account password.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['currentPassword', 'newPassword', 'confirm'].map((field) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '24px', color: '#0f172a' }}>
            {step === 1 ? '📧 Forgot Password' : '🔢 Enter OTP'}
          </h2>
          {step === 1 ? (
            <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="College email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
              <button type="submit" disabled={loading}
                style={{ padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
              <input type="password" placeholder="New Password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
              <button type="submit" disabled={loading}
                style={{ padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #172554)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <button onClick={() => navigate('/login')} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', display: 'block', width: '100%', textAlign: 'center' }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
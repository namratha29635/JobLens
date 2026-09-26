import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setForm(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg('Please fill all fields');
      return toast.error('Please fill all fields');
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { user } = await login(form.email, form.password);
      if (user.isFirstLogin) {
        toast('Welcome! Please change your default password.', { icon: '🔐' });
        navigate('/change-password');
      } else if (user.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.05) 0%, transparent 60%)',
      padding: '20px',
    }}>
      {/* Decorative lines */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.3 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: `${15 + i * 18}%`, left: '-5%', right: '-5%',
            height: '1px', background: `linear-gradient(90deg, transparent, rgba(0,212,255,${0.1 + i * 0.02}), transparent)`,
            transform: 'rotate(-8deg)',
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '440px', animation: 'slideUp 0.4s ease' }}>
        {/* Back to Home Link */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '20px', marginBottom: '16px', fontSize: '28px',
          }}>🎯</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>JobLens</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Campus Placement Management System
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: '0 0 60px rgba(0,212,255,0.05)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '24px' }}>
            Sign In
          </h2>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
              marginBottom: '18px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{errorMsg}</div>
                {errorMsg.toLowerCase().includes('not exist') && (
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      display: 'block',
                    }}
                  >
                    Click here to create an account now →
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                College Email
              </label>
              <input
                type="email"
                placeholder="yourroll@college.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: 'var(--text-primary)', padding: '12px 16px',
                  fontSize: '14px',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', color: 'var(--text-primary)', padding: '12px 48px 12px 16px',
                    fontSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                  fontSize: '16px',
                }}>{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, var(--accent-primary), #0099cc)',
                color: 'var(--bg-primary)', border: 'none',
                borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid var(--bg-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
            >
              Create Account →
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Quick Demo Login (1-Click Fill)
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setForm({ email: 'coordinator@college.edu', password: 'Test@123' })}
              style={{
                flex: 1, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              💼 <strong style={{ color: 'var(--text-primary)' }}>Coordinator</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>coordinator@college.edu</div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'student@college.edu', password: 'Test@123' })}
              style={{
                flex: 1, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              🎓 <strong style={{ color: 'var(--text-primary)' }}>Student</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>student@college.edu</div>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          JobLens Campus Placement & Drive Management System
        </p>
      </div>
    </div>
  );
}
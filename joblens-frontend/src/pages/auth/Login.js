import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThreeJsBackground from '../../components/ui/ThreeJsBackground';
import ThemeToggle from '../../components/ui/ThemeToggle';
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
      setForm((prev) => ({ ...prev, email: location.state.email }));
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '24px 16px',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
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
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Home
          </button>
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '58px',
              height: '58px',
              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
              borderRadius: '16px',
              marginBottom: '14px',
              fontSize: '26px',
              boxShadow: '0 6px 18px rgba(79, 70, 229, 0.28)',
              color: '#ffffff',
            }}
          >
            🎯
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 800,
              marginBottom: '6px',
            }}
          >
            <span className="brand-letter-j">J</span>
            <span className="brand-letters-rest">obLens</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
            Job Search and AI Verification
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: 'var(--shadow-elevation)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
            Sign In
          </h2>

          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{errorMsg}</div>
                {errorMsg.toLowerCase().includes('not exist') && (
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand)',
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="yourname@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  padding: '12px 16px',
                  fontSize: '14px',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    padding: '12px 48px 12px 16px',
                    fontSize: '14px',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: '16px',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid transparent',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              Create Account →
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            Quick Demo Login (1-Click Fill)
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setForm({ email: 'coordinator@college.edu', password: 'Test@123' })}
              style={{
                flex: '1 1 140px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              💼 <strong style={{ color: 'var(--text-primary)' }}>Coordinator</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>coordinator@college.edu</div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'student@college.edu', password: 'Test@123' })}
              style={{
                flex: '1 1 140px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🎓 <strong style={{ color: 'var(--text-primary)' }}>Student</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>student@college.edu</div>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          JobLens · Job Search and AI Verification
        </p>
      </div>
    </div>
  );
}
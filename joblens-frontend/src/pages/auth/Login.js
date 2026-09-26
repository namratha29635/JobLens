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
  const [successMsg, setSuccessMsg] = useState(
    location.state?.registeredSuccess
      ? 'Account created successfully! Please enter your password to sign in.'
      : ''
  );
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.registeredSuccess) {
      setSuccessMsg('Account created successfully! Please enter your password to sign in.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg('Please enter both email and password');
      return toast.error('Please enter both email and password');
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
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
    transition: 'border-color 0.2s, box-shadow 0.2s',
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
            🎯
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
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
            Job Search and AI Verification
          </p>
        </div>

        {/* Form Card (Crisp White Box) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: '0 20px 45px -10px rgba(79, 70, 229, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
            color: '#0f172a',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
            Sign In
          </h2>

          {/* Success Banner if redirected from registration */}
          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#059669',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '16px' }}>✅</span>
              <div>{successMsg}</div>
            </div>
          )}

          {/* Error Banner when Login Fails */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
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
                    onClick={() => navigate('/signup', { state: { email: form.email } })}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#4f46e5',
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
              <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="yourname@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#1e293b', marginBottom: '6px', fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
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
                    color: '#64748b',
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
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.32)',
                transition: 'all 0.2s',
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
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
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
                color: '#4f46e5',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              Create Account →
            </button>
          </div>
        </div>

        {/* Quick Demo Credentials */}
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
            color: '#0f172a',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: '#64748b',
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
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                color: '#1e293b',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              💼 <strong style={{ color: '#0f172a' }}>Coordinator</strong>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>coordinator@college.edu</div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'student@college.edu', password: 'Test@123' })}
              style={{
                flex: '1 1 140px',
                padding: '8px 10px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                color: '#1e293b',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🎓 <strong style={{ color: '#0f172a' }}>Student</strong>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>student@college.edu</div>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
          JobLens · Job Search and AI Verification
        </p>
      </div>
    </div>
  );
}
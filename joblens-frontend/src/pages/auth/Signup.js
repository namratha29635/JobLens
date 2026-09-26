import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThreeJsBackground from '../../components/ui/ThreeJsBackground';
import ThemeToggle from '../../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'AIML', 'DS', 'MECH', 'CIVIL'];
const BATCHES = [2026, 2027, 2028, 2029];

export default function Signup() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'CSE',
    passedOutYear: '2026',
    cgpa: '8.0',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.name.trim()) {
      return toast.error('Please enter your full name');
    }
    if (!form.email || !form.password) {
      return toast.error('Email and password are required');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = {
        role,
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
      };

      if (role === 'student') {
        payload.rollNumber = form.rollNumber.trim() || undefined;
        payload.branch = form.branch;
        payload.passedOutYear = Number(form.passedOutYear);
        payload.cgpa = Number(form.cgpa) || 8.0;
      }

      const { user } = await register(payload);
      toast.success('Account created successfully! Welcome to JobLens.', { duration: 4000, icon: '🎉' });

      if (user.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#0f172a',
    padding: '11px 14px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#334155',
    marginBottom: '5px',
    fontWeight: 600,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 20% 15%, rgba(99, 102, 241, 0.09) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 45%), #f8fafc',
        color: '#0f172a',
        padding: '30px 16px',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      <ThreeJsBackground />

      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          animation: 'slideUp 0.35s ease',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
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

        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
              borderRadius: '16px',
              marginBottom: '12px',
              fontSize: '24px',
              boxShadow: '0 6px 18px rgba(79, 70, 229, 0.28)',
              color: '#ffffff',
            }}
          >
            🎯
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              fontWeight: 800,
              marginBottom: '6px',
            }}
          >
            <span style={{ color: '#4f46e5', fontWeight: 900 }}>J</span>
            <span style={{ color: '#0f172a' }}>obLens</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
            Job Search and AI Verification
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: 'clamp(22px, 5vw, 32px)',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
            color: '#0f172a',
          }}
        >
          {/* Role selector tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '4px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '6px',
                background: role === 'student' ? 'linear-gradient(135deg, #4f46e5, #172554)' : 'transparent',
                color: role === 'student' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: role === 'student' ? '0 2px 8px rgba(79, 70, 229, 0.2)' : 'none',
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setRole('coordinator')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '6px',
                background: role === 'coordinator' ? 'linear-gradient(135deg, #4f46e5, #172554)' : 'transparent',
                color: role === 'coordinator' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: role === 'coordinator' ? '0 2px 8px rgba(79, 70, 229, 0.2)' : 'none',
              }}
            >
              💼 Coordinator
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder={role === 'student' ? 'John Doe' : 'Dr. Coordinator Admin'}
                value={form.name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>
                {role === 'student' ? 'Email Address' : 'Official Email'}
              </label>
              <input
                type="email"
                name="email"
                placeholder={role === 'student' ? 'student@domain.com' : 'coordinator@domain.com'}
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            {/* Student-only fields */}
            {role === 'student' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      placeholder="e.g. 23MH1A05L3"
                      value={form.rollNumber}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Branch</label>
                    <select
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Graduation Batch</label>
                    <select
                      name="passedOutYear"
                      value={form.passedOutYear}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {BATCHES.map((y) => (
                        <option key={y} value={y}>
                          {y} Batch
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>CGPA (out of 10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      placeholder="8.5"
                      value={form.cgpa}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: '44px' }}
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

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '4px',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.28)',
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
                  Creating Account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          {/* Already have an account link */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                padding: 0,
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          JobLens · Job Search and AI Verification
        </p>
      </div>
    </div>
  );
}

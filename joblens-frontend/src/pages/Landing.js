import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAuthRedirect = (defaultPath) => {
    if (user) {
      if (user.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      navigate(defaultPath);
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background Gradients & Ambient Glow */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── HEADER NAVIGATION ──────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 48px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
            }}
          >
            🎯
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              JobLens
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              AI Job & Placement Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-only"
        >
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, 'home')}
            style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
            Home
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
            How it Works
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, 'about')}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
            About
          </a>
        </nav>

        {/* Auth CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <button
              onClick={() => handleAuthRedirect('/')}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius)',
                background: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)',
                }}
              >
                Student Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          padding: '80px 24px 60px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--accent-primary)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          <span>🚀</span> Next-Generation Job Discovery & AI Verification
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 62px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
          }}
        >
          Your Smart Job Placement <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8 20%, #818cf8 60%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Companion & AI Verifier
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Discover verified job opportunities, track applications in real-time, verify suspicious postings, and match off-campus drives directly against your resume skills.
        </p>

        {/* Hero Role Login Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          <button
            onClick={() => handleAuthRedirect('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(56, 189, 248, 0.35)',
              transition: 'transform 0.2s ease',
            }}
          >
            <span>🎓</span> Student Login
          </button>

          <button
            onClick={() => handleAuthRedirect('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🏛️</span> Coordinator Login
          </button>

          <button
            onClick={() => handleAuthRedirect('/signup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              borderRadius: 'var(--radius)',
              background: 'rgba(124, 58, 237, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            <span>✨</span> Create Student Account
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '950px',
            margin: '0 auto',
            padding: '20px 24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
              100%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Hiring Drives</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-display)' }}>
              AI Powered
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resume Keyword Matching</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'var(--font-display)' }}>
              Live
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In-App Multi-Channel Alerts</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-display)' }}>
              Zero Fake
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Job Scam Risk Analyzer</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            Built for Modern Job Seekers & Placements
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive intelligent tools designed to give students and placement coordinators complete visibility and trust.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              🏢
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Hiring Drive Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Coordinators publish verified off-campus & hiring drives with cutoffs, eligible branches, and CTC packages. Eligible candidates can apply with a single click.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(124, 58, 237, 0.12)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              🎯
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Resume–Job Matching
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              AI extracts your skills and compares them directly against the job description to calculate your match score and highlight missing high-priority skills.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              🛡️
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Job Scam Verification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Scan suspicious off-campus postings for upfront registration fee demands, urgent pressure tactics, unrealistic compensation claims, and unverified recruiter domains.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(52, 211, 153, 0.12)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              📝
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Application Tracking
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Track every step of your application lifecycle from Applied ➔ Shortlisted ➔ Interview Rounds ➔ Final Selection with full history and feedback.
            </p>
          </div>

          {/* Card 5 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(251, 191, 36, 0.12)',
                color: 'var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              🔔
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Instant Notifications
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Instant in-app alerts and notifications whenever new drives are announced, interview rounds are scheduled, or shortlist results are published.
            </p>
          </div>

          {/* Card 6 */}
          <div
            style={{
              padding: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}
            >
              📊
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Coordinator Command Hub
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Powerful operations center for coordinators to filter applicants by branch, batch, and CGPA, review PDF resumes directly, and broadcast instant updates.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            Seamless 4-Step Process
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            How JobLens Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
            From uploading your resume to landing verified job offers, our intelligent platform powers every milestone of your career journey.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            position: 'relative',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                📄
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(56, 189, 248, 0.3)',
                }}
              >
                01
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>
              1. Upload & Parse Resume
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Upload your PDF resume once. The built-in NLP parser automatically extracts your technical skills, programming languages, education, and project background.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🤖
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(124, 58, 237, 0.3)',
                }}
              >
                02
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>
              2. AI Resume–Job Matching
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Browse curated off-campus opportunities. The AI calculates exact percentage match scores against job requirements and recommends missing skills to boost your selection chances.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🛡️
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                03
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>
              3. Verify Scams & Safety
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Run suspicious postings through our AI Job Scam Analyzer to detect upfront registration fees, fake recruiter domains, high-pressure urgency flags, and phishing links.
            </p>
          </div>

          {/* Step 4 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🎯
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(52, 211, 153, 0.3)',
                }}
              >
                04
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>
              4. Apply & Track Status
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Apply to opportunities and track your stage in real time from Applied ➔ Shortlisted ➔ Interview Rounds ➔ Offer, while receiving instant in-app alerts for all updates.
            </p>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ─────────────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          padding: '60px 24px 80px',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(99, 102, 241, 0.08))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              letterSpacing: '0.1em',
            }}
          >
            About JobLens
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 800,
              margin: 0,
            }}
          >
            Empowering Job Placements with Intelligence & Trust
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
            JobLens is an intelligent job verification and placement management platform developed to bridge candidates and opportunities. By combining authentic hiring drive scheduling with state-of-the-art AI skill matching and scam detection heuristics, JobLens equips students to make informed career decisions while enabling coordinators to streamline applications effortlessly.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 22px',
                background: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Sign In to Portal →
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                padding: '10px 22px',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Register as New Student
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          padding: '30px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>JobLens</span>
          <span>· AI-Powered Job Placement & Verification Portal</span>
        </div>

        <div>
          © {new Date().getFullYear()} JobLens. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

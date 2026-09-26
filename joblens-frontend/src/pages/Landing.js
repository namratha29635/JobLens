import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThreeJsBackground from '../components/ui/ThreeJsBackground';
import FeaturesCarousel from '../components/ui/FeaturesCarousel';
import ThemeToggle from '../components/ui/ThemeToggle';
import LiveActivityPopup from '../components/ui/LiveActivityPopup';
import { Menu, X } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
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
        width: '100%',
        maxWidth: '100vw',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Interactive WebGL / Three.js Canvas Background */}
      <ThreeJsBackground />

      {/* Subtle Ambient Light Orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-15%',
          left: '10%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '5%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.07) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1,
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
          padding: '14px clamp(16px, 4vw, 48px)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          width: '100%',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Brand Logo */}
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
              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              color: '#ffffff',
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
                background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              JobLens
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Off-Campus Job & AI Verification
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            alignItems: 'center',
            gap: '28px',
          }}
          className="desktop-only"
        >
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, 'home')}
            style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
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

        {/* Auth CTA Buttons, Theme Toggle & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />

          {user ? (
            <button
              onClick={() => handleAuthRedirect('/')}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="desktop-only"
                style={{
                  padding: '8px 16px',
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
                  padding: '8px 16px',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #4f46e5, #172554)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                Student Sign Up
              </button>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown Modal */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-floating)',
            zIndex: 99,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, 'home')}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', padding: '6px 0' }}
          >
            Home
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 0' }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 0' }}
          >
            How it Works
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, 'about')}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 0' }}
          >
            About
          </a>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0 4px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Appearance</span>
            <ThemeToggle />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Student Sign Up
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          padding: 'clamp(40px, 8vw, 72px) 20px clamp(40px, 6vw, 60px)',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            color: 'var(--brand)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <span>🚀</span> Next-Generation Job Discovery & AI Verification
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '18px',
          }}
        >
          Your Smart Job Placement <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #06b6d4 15%, #4f46e5 60%, #172554 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Companion & AI Verifier
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 32px',
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
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          <button
            onClick={() => handleAuthRedirect('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '13px 26px',
              borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, #4f46e5, #172554)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
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
              padding: '13px 26px',
              borderRadius: 'var(--radius)',
              background: '#ffffff',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              fontWeight: 700,
              fontSize: '14px',
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
              padding: '13px 22px',
              borderRadius: 'var(--radius)',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#0891b2',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontWeight: 700,
              fontSize: '14px',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '14px',
            maxWidth: '950px',
            margin: '0 auto',
            padding: '20px 24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
              100%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Verified Hiring Drives</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-display)' }}>
              AI Powered
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Resume Keyword Matching</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'var(--font-display)' }}>
              Live
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>In-App Multi-Channel Alerts</div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0891b2', fontFamily: 'var(--font-display)' }}>
              Zero Fake
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Job Scam Risk Analyzer</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: '70px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            Built for Modern Job Seekers & Placements
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive intelligent tools designed to give students and placement coordinators complete visibility and trust.
          </p>
        </div>

        <FeaturesCarousel />
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '70px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.25)',
              color: 'var(--brand)',
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
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            How JobLens Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '650px', margin: '0 auto' }}>
            From uploading your resume to landing verified job offers, our intelligent platform powers every milestone of your career journey.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '18px',
            position: 'relative',
          }}
        >
          {/* Step 1 */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px 22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                📄
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(6, 182, 212, 0.3)',
                }}
              >
                01
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
              1. Upload & Parse Resume
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Upload your PDF resume once. The built-in NLP parser automatically extracts your technical skills, programming languages, education, and project background.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px 22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🤖
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(79, 70, 229, 0.3)',
                }}
              >
                02
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
              2. AI Resume–Job Matching
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Browse curated off-campus opportunities. The AI calculates exact percentage match scores against job requirements and recommends missing skills to boost your selection chances.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px 22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🛡️
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                03
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
              3. Verify Scams & Safety
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Run suspicious postings through our AI Job Scam Analyzer to detect upfront registration fees, fake recruiter domains, high-pressure urgency flags, and phishing links.
            </p>
          </div>

          {/* Step 4 */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px 22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🎯
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(16, 185, 129, 0.3)',
                }}
              >
                04
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
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
          padding: '50px 20px 80px',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <div
          style={{
            padding: 'clamp(24px, 5vw, 44px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--brand)',
              letterSpacing: '0.08em',
            }}
          >
            About JobLens
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3.5vw, 26px)',
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
              gap: '14px',
              marginTop: '8px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '11px 22px',
                background: 'linear-gradient(135deg, #4f46e5, #172554)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
            >
              Sign In to Portal →
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                padding: '11px 22px',
                background: '#ffffff',
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
          background: 'var(--bg-card)',
          padding: '24px clamp(16px, 4vw, 48px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          zIndex: 2,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>JobLens</span>
          <span>· Off-Campus Job Discovery & AI Verification Portal</span>
        </div>

        <div>
          © {new Date().getFullYear()} JobLens. All rights reserved.
        </div>
      </footer>

      {/* Real-time Verified Activity Notification Toast */}
      <LiveActivityPopup />
    </div>
  );
}

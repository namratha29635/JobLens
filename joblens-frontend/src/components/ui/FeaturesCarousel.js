import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES_DATA = [
  {
    id: 1,
    icon: '🏢',
    title: 'Hiring Drive Management',
    desc: 'Coordinators publish verified off-campus & hiring drives with cutoffs, eligible branches, and CTC packages. Eligible candidates can apply with a single click.',
    tag: 'Off-Campus Drives',
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.08)',
    details: [
      'Automated batch & CGPA eligibility filtering',
      'Direct 1-click application submission with resume dispatch',
      'Round-by-round interview schedule broadcasting',
      'Recruiter verification & corporate email validation',
    ],
    metric: '100% Verified Recruiter Profiles',
  },
  {
    id: 2,
    icon: '🎯',
    title: 'Resume–Job Matching',
    desc: 'AI extracts your skills and compares them directly against the job description to calculate your match score and highlight missing high-priority skills.',
    tag: 'Match Score %',
    color: '#0891b2',
    bg: 'rgba(6, 182, 212, 0.08)',
    details: [
      'Deep semantic NLP skill & tech-stack extraction',
      'Match percentage calculation against active job descriptions',
      'Missing high-impact keywords recommendations',
      'ATS compatibility heuristics & formatting checks',
    ],
    metric: '96% Fit Scoring Precision',
  },
  {
    id: 3,
    icon: '🛡️',
    title: 'Job Scam Verification',
    desc: 'Scan suspicious off-campus postings for upfront registration fee demands, urgent pressure tactics, unrealistic compensation claims, and unverified recruiter domains.',
    tag: 'Scam Shield',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    details: [
      'Scans for upfront registration or training fee requests',
      'Flags unverified public email providers (@gmail, @yahoo)',
      'Pressure heuristic detection (urgent payment countdowns)',
      'Level 1–3 verification badges issued for validated employers',
    ],
    metric: 'Zero Fake Job Postings Allowed',
  },
  {
    id: 4,
    icon: '📝',
    title: 'Application Tracking',
    desc: 'Track every step of your application lifecycle from Applied ➔ Shortlisted ➔ Interview Rounds ➔ Final Selection with full history and feedback.',
    tag: 'Real-Time Stages',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    details: [
      'Live visual stage timeline with current status indicators',
      'Complete round-wise performance history & feedback logs',
      'Offer letter and CTC package tracking',
      'Single consolidated dashboard across all job applications',
    ],
    metric: 'Real-Time Status Synchronization',
  },
  {
    id: 5,
    icon: '🔔',
    title: 'Instant Notifications',
    desc: 'Instant in-app alerts and notifications whenever new drives are announced, interview rounds are scheduled, or shortlist results are published.',
    tag: 'Live Alerts',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    details: [
      'Instant notifications for new eligible off-campus drives',
      'Round interview schedule change alerts and reminders',
      'Shortlist results & selection status notifications',
      'Integrated in-app notification center with read/unread tracking',
    ],
    metric: '< 200ms Notification Dispatch',
  },
  {
    id: 6,
    icon: '📊',
    title: 'Coordinator Command Hub',
    desc: 'Powerful operations center for coordinators to filter applicants by branch, batch, and CGPA, review PDF resumes directly, and broadcast instant updates.',
    tag: 'Placement Reports',
    color: '#0f172a',
    bg: 'rgba(15, 23, 42, 0.08)',
    details: [
      'Branch-wise and batch-wise applicant segmentation',
      'In-browser PDF resume review and status advancement',
      'Exportable placement statistics and CTC distribution charts',
      'Bulk candidate shortlisting and interview round setup',
    ],
    metric: 'End-to-End Coordinator Visibility',
  },
];

export default function FeaturesCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef(null);

  // Responsive itemsPerView calculation
  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1080) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  const maxIndex = Math.max(0, FEATURES_DATA.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-move carousel every 3.4 seconds unless hovered, touched, or modal is open
  useEffect(() => {
    if (isPaused || selectedFeature) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3400);
    return () => clearInterval(interval);
  }, [isPaused, selectedFeature, nextSlide]);

  // Touch gesture handlers for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setIsPaused(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 0 20px',
      }}
    >
      {/* Top Controls Bar: Active Counter & Navigation Arrows */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand)',
              background: 'var(--brand-bg)',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border-accent)',
            }}
          >
            Interactive Feature Explorer
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {currentIndex + 1} of {maxIndex + 1}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous feature"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next feature"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #172554)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.28)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Overflow Carousel Viewport */}
      <div
        style={{
          overflow: 'hidden',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          padding: '4px 4px 14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            gap: '0px',
          }}
        >
          {FEATURES_DATA.map((item) => (
            <div
              key={item.id}
              style={{
                flex: `0 0 ${100 / itemsPerView}%`,
                maxWidth: `${100 / itemsPerView}%`,
                padding: '0 10px',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="feature-carousel-card"
                onClick={() => setSelectedFeature(item)}
                style={{
                  height: '100%',
                  minHeight: '290px',
                  padding: '30px 26px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {/* Subtle top indicator bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: item.color,
                    opacity: 0.85,
                  }}
                />

                <div>
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
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: item.bg,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: `0 4px 12px ${item.bg}`,
                      }}
                    >
                      {item.icon}
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: item.color,
                        background: item.bg,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '19px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '13.5px',
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '22px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--brand)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Active in Platform →
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    Module 0{item.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              height: '7px',
              width: currentIndex === idx ? '28px' : '8px',
              borderRadius: '999px',
              background: currentIndex === idx ? 'var(--brand)' : 'var(--border-light)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HANASU & BOOKSWAP-STYLE INTERACTIVE DETAIL POPUP MODAL               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedFeature && (
        <div
          onClick={() => setSelectedFeature(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-floating)',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
              animation: 'scaleUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: selectedFeature.bg,
                    color: selectedFeature.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  {selectedFeature.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {selectedFeature.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: selectedFeature.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {selectedFeature.tag} · Module 0{selectedFeature.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                aria-label="Close modal"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px' }}>
              <p
                style={{
                  fontSize: '14.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '20px',
                }}
              >
                {selectedFeature.desc}
              </p>

              {/* Verified Metric Badge */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--brand-bg)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                <Sparkles size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--brand)',
                  }}
                >
                  {selectedFeature.metric}
                </span>
              </div>

              {/* Capability Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    marginBottom: '12px',
                  }}
                >
                  Core Platform Capabilities
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedFeature.details.map((detail, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13.5px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFeature(null);
                    navigate('/login');
                  }}
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    background: 'linear-gradient(135deg, #4f46e5, #172554)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  <span>Access in Portal</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  style={{
                    padding: '13px 22px',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

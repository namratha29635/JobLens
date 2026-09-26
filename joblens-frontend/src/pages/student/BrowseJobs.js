import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Search,
  Filter,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  X,
  CheckCircle2,
  RefreshCw,
  Award,
  Zap,
  Tag,
  Layers,
  Check,
  Bookmark,
} from 'lucide-react';
import { initialJobs } from '../../data/mockData';
import { Button, Badge, VerificationBadge, Spinner } from '../../components/ui';
import JobDetailsModal from '../../components/ui/JobDetailsModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BrowseJobs() {
  const { user, profile } = useAuth();

  // Resume state
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedSkills, setParsedSkills] = useState([]);
  const [skippedResume, setSkippedResume] = useState(false);

  // Search and filter state
  const [jobs, setJobs] = useState(initialJobs || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [minSalary, setMinSalary] = useState(0);
  const [sortBy, setSortBy] = useState('match');
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(['JOB-2026-001', 'JOB-2026-003']);

  // Handle resume file upload
  const handleFileUpload = (file) => {
    if (!file) return;
    setParsingResume(true);
    setResumeFileName(file.name);

    setTimeout(() => {
      const extracted = ['React', 'Node.js', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'System Design'];
      setParsedSkills(extracted);
      setParsingResume(false);
      setResumeUploaded(true);
      setSkippedResume(false);
      toast.success(`Resume "${file.name}" analyzed! Found 8 core engineering skills.`);
    }, 1000);
  };

  // Handle using profile resume
  const handleUseProfileResume = () => {
    setParsingResume(true);
    setResumeFileName('College_Profile_Resume.pdf');

    setTimeout(() => {
      const extracted = ['React', 'Node.js', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'AWS', 'System Design'];
      setParsedSkills(extracted);
      setParsingResume(false);
      setResumeUploaded(true);
      setSkippedResume(false);
      toast.success('Loaded verified college profile resume! Skills matched with open drives.');
    }, 900);
  };

  // Compute Match Score for each job based on parsed skills
  const scoredJobs = useMemo(() => {
    return (jobs || []).map((job) => {
      const jobSkills = job.skills || [];
      if (!resumeUploaded || parsedSkills.length === 0) {
        return {
          ...job,
          matchScore: 85,
          matchingSkills: jobSkills.slice(0, 3),
          missingSkills: jobSkills.slice(3),
        };
      }

      // Calculate overlap
      const matching = jobSkills.filter((js) =>
        parsedSkills.some((ps) => ps.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(ps.toLowerCase()))
      );
      const missing = jobSkills.filter((js) => !matching.includes(js));

      let score = Math.round((matching.length / Math.max(jobSkills.length, 1)) * 100);
      score = Math.max(score, 60);
      if (matching.length >= 3) score = Math.min(score + 18, 98);

      return {
        ...job,
        matchScore: score,
        matchingSkills: matching,
        missingSkills: missing,
      };
    });
  }, [jobs, resumeUploaded, parsedSkills]);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return scoredJobs
      .filter((job) => {
        // Search
        const searchTarget = `${job.title || ''} ${job.company || ''} ${job.location || ''} ${(job.skills || []).join(' ')}`.toLowerCase();
        const matchesSearch = !searchTerm || searchTarget.includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Type
        if (selectedType !== 'All' && job.type && !job.type.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }

        // Mode
        if (selectedMode !== 'All' && job.mode && !job.mode.toLowerCase().includes(selectedMode.toLowerCase())) {
          return false;
        }

        // Verification Level
        if (selectedVerification !== 'All') {
          const isVerified = job.verified || job.verificationStatus === 'Verified' || job.verificationLevel === 'Level 3';
          if (selectedVerification === 'Verified Only' && !isVerified) return false;
          if (selectedVerification === 'Level 3' && job.verificationLevel !== 'Level 3' && job.verificationStatus !== 'Verified') return false;
          if (selectedVerification === 'Level 2' && job.verificationLevel !== 'Level 2') return false;
          if (selectedVerification === 'Suspicious' && job.verificationStatus !== 'Suspicious' && !job.isSuspicious) return false;
        }

        // Min Match Score
        if (minMatchScore > 0 && job.matchScore < minMatchScore) return false;

        // Min Salary CTC
        if (minSalary > 0) {
          const salaryStr = job.salary || job.ctc || '';
          const match = salaryStr.match(/(\d+(\.\d+)?)/);
          const val = match ? parseFloat(match[0]) : 0;
          if (val < minSalary && !salaryStr.includes('month')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'newest') {
          const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
          return dateB - dateA;
        }
        if (sortBy === 'salary-high') {
          const matchA = (a.salary || a.ctc || '').match(/(\d+(\.\d+)?)/);
          const matchB = (b.salary || b.ctc || '').match(/(\d+(\.\d+)?)/);
          const valA = matchA ? parseFloat(matchA[0]) : 0;
          const valB = matchB ? parseFloat(matchB[0]) : 0;
          return valB - valA;
        }
        return 0;
      });
  }, [scoredJobs, searchTerm, selectedType, selectedMode, selectedVerification, minMatchScore, minSalary, sortBy]);

  const toggleSave = (jobId, e) => {
    if (e) e.stopPropagation();
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      toast('Job removed from bookmarks', { icon: '🔖' });
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      toast.success('Job saved to your bookmarks!');
    }
  };

  const handleApply = (job) => {
    toast.success(`Application initiated for ${job.title} at ${job.company}!`);
  };

  return (
    <div className="space-y-6">
      {/* ── STEP 1: RESUME UPLOAD PROMPT (IF NOT YET UPLOADED & NOT SKIPPED) ── */}
      {!resumeUploaded && !skippedResume && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '2px dashed var(--brand)',
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--brand-bg)',
                color: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
              }}
            >
              <UploadCloud size={32} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-bg)', color: 'var(--brand)', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={14} /> Step 1: Upload Resume for AI Match
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Upload Your Resume to Unlock Personalized Job Matches
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Our AI engine scans your tech stack, projects, and CGPA to rank off-campus job drives from highest to lowest compatibility score.
            </p>

            {parsingResume ? (
              <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Spinner size={32} color="var(--brand)" />
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Parsing {resumeFileName}...
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Extracting skills, framework proficiencies, and matching with open company drives...
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* File Input */}
                  <label
                    style={{
                      padding: '12px 26px',
                      background: 'var(--brand)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    <FileText size={18} /> Upload Resume (PDF / DOCX)
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <Button variant="secondary" size="lg" onClick={handleUseProfileResume}>
                    <Zap size={16} /> Use My College Profile Resume
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setSkippedResume(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginTop: '4px',
                  }}
                >
                  Skip and browse all jobs without personalized matching →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACTIVE RESUME BANNER (IF RESUME UPLOADED) ── */}
      {resumeUploaded && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Active Resume: {resumeFileName}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  ✓ AI Scored
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Detected Skills:</span>
                {parsedSkills.map((s) => (
                  <span key={s} style={{ fontSize: '11px', fontWeight: 600, background: 'var(--bg-elevated)', color: 'var(--brand)', padding: '1px 7px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <label
              style={{
                padding: '7px 14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={13} /> Switch Resume
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {/* Main Search Bar */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by role, company name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                fontSize: '14px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Job Type Dropdown */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="All">All Work Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">On-site</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Second Row: Match Score Filter, Verification, Sort */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Quick Pill Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--accent-green)" /> Verification:
            </span>
            {['All', 'Verified Only', 'Level 3', 'Suspicious'].map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedVerification(pill)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedVerification === pill ? 'var(--brand)' : 'var(--bg-elevated)',
                  color: selectedVerification === pill ? '#ffffff' : 'var(--text-secondary)',
                  border: selectedVerification === pill ? '1px solid var(--brand)' : '1px solid var(--border)',
                  transition: 'all 0.15s ease',
                }}
              >
                {pill}
              </button>
            ))}

            {resumeUploaded && (
              <button
                type="button"
                onClick={() => setMinMatchScore(minMatchScore === 80 ? 0 : 80)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: minMatchScore === 80 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-elevated)',
                  color: minMatchScore === 80 ? 'var(--accent-green)' : 'var(--text-secondary)',
                  border: minMatchScore === 80 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                }}
              >
                ⭐ 80%+ Match Only
              </button>
            )}
          </div>

          {/* Sort By & Min CTC */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Min CTC: {minSalary > 0 ? `${minSalary} LPA` : 'Any'}</span>
              <input
                type="range"
                min="0"
                max="25"
                step="2"
                value={minSalary}
                onChange={(e) => setMinSalary(parseInt(e.target.value, 10))}
                style={{ width: '85px', cursor: 'pointer', accentColor: 'var(--brand)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="match">Sort: Best Resume Match %</option>
                <option value="newest">Sort: Nearest Deadline</option>
                <option value="salary-high">Sort: Highest CTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Showing <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filteredJobs.length}</span> matching opportunities
          {resumeUploaded && <span style={{ color: '#16a34a', fontWeight: 700 }}> • Ranked by Resume Compatibility</span>}
        </div>
        {(searchTerm || selectedType !== 'All' || selectedMode !== 'All' || selectedVerification !== 'All' || minMatchScore > 0 || minSalary > 0) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
              setSelectedMode('All');
              setSelectedVerification('All');
              setMinMatchScore(0);
              setMinSalary(0);
            }}
            style={{
              fontSize: '12px',
              color: 'var(--brand)',
              background: 'none',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Scored Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => {
            const isMatchHigh = job.matchScore >= 85;
            const matchColor = isMatchHigh ? '#10b981' : job.matchScore >= 70 ? 'var(--brand)' : '#f59e0b';
            const matchBg = isMatchHigh ? 'rgba(16, 185, 129, 0.12)' : job.matchScore >= 70 ? 'var(--brand-bg)' : 'rgba(245, 158, 11, 0.12)';

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                style={{
                  background: 'var(--bg-card)',
                  border: isMatchHigh ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: isMatchHigh ? '0 8px 20px -4px rgba(79, 70, 229, 0.12)' : 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-elevation)';
                  e.currentTarget.style.borderColor = 'var(--brand)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isMatchHigh ? 'var(--border-accent)' : 'var(--border)';
                  e.currentTarget.style.boxShadow = isMatchHigh ? '0 8px 20px -4px rgba(79, 70, 229, 0.12)' : 'var(--shadow-card)';
                }}
              >
                <div>
                  {/* Top Match Score Pill & Verification Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: matchBg,
                        color: matchColor,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: `1px solid ${matchColor}33`,
                      }}
                    >
                      <Sparkles size={12} /> {job.matchScore}% Match
                      {isMatchHigh && <span style={{ fontSize: '10px', fontWeight: 700 }}>• Top Fit</span>}
                    </div>

                    <VerificationBadge level={job.verificationLevel || (job.verified ? 'Level 3' : 'Pending')} size="sm" />
                  </div>

                  {/* Company & Title */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        flexShrink: 0,
                      }}
                    >
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Building2 size={22} color="var(--text-muted)" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{job.company}</div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata: Location & Salary */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#0284c7" /> {job.location}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--accent-green)' }}>
                      <DollarSign size={13} color="var(--accent-green)" /> {job.salary || job.ctc}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={13} color="var(--brand)" /> {job.type}
                    </span>
                  </div>

                  {/* Matching Skills */}
                  {job.matchingSkills && job.matchingSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                      {job.matchingSkills.map((s) => (
                        <span key={s} style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={10} /> {s}
                        </span>
                      ))}
                      {job.missingSkills && job.missingSkills.slice(0, 2).map((s) => (
                        <span key={s} style={{ fontSize: '11px', fontWeight: 500, background: 'var(--bg-elevated)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job);
                    }}
                  >
                    Apply Now ⚡
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)',
            }}
          >
            <Briefcase size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No matching job postings found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
            Try adjusting your search terms or lowering your minimum salary threshold.
          </p>
        </div>
      )}

      {/* Interactive Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          isSaved={savedJobIds.includes(selectedJob.id)}
          onToggleSave={(id) => toggleSave(selectedJob.id)}
          onApply={(job) => {
            handleApply(job);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}

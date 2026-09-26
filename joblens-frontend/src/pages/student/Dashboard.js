import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_JOBS } from '../../data/mockData';
import {
  Search,
  Filter,
  Briefcase,
  Send,
  CalendarCheck,
  Bookmark,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { StatCard, JobCard, Button, Badge, Modal, VerificationBadge } from '../../components/ui';
import JobDetailsModal from '../../components/ui/JobDetailsModal';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedJobIds, setSavedJobIds] = useState(['JOB-2026-001', 'JOB-2026-003']);
  const [activeModalJob, setActiveModalJob] = useState(null);

  const studentName = profile?.name || user?.name || 'Student';

  // Toggle Save Job
  const handleToggleSave = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      toast.success('Job removed from saved list');
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      toast.success('Job saved to your bookmarks!', { icon: '🔖' });
    }
  };

  // Handle 1-click Apply
  const handleApply = (job) => {
    toast.success(`Application submitted to ${job.company} for ${job.title}!`, {
      icon: '🎉',
      duration: 4000,
    });
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation =
      selectedLocation === 'All' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = selectedType === 'All' || job.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || (job.category && job.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesLocation && matchesType && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(79, 70, 229, 0.08))',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
            <ShieldCheck size={14} /> Official Verified Placement Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Good Morning, {studentName} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Find verified opportunities and track your applications in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={ShieldCheck}
            onClick={() => navigate('/student/verifier')}
          >
            Verify a Job Link
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Briefcase}
            onClick={() => navigate('/student/browse')}
          >
            Browse All 140+ Jobs
          </Button>
        </div>
      </div>

      {/* Prominent Search & Quick Filter Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills (e.g. SDE-1, Google, React, Python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Filters:
          </span>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="All">📍 All Locations</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Remote">Remote / Hybrid</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="All">💼 All Job Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="All">🎯 All Roles / Tracks</option>
            <option value="Software">Software Engineering</option>
            <option value="Full Stack">Full Stack</option>
            <option value="AI">AI / Machine Learning</option>
            <option value="Fintech">Fintech</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Design">Product Design</option>
          </select>

          {(searchTerm || selectedLocation !== 'All' || selectedType !== 'All' || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('All');
                setSelectedType('All');
                setSelectedCategory('All');
              }}
              style={{
                fontSize: '12px',
                color: 'var(--brand)',
                background: 'none',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Statistics Animated Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}
      >
        <StatCard
          label="Jobs Available"
          value="142"
          icon={Briefcase}
          color="#2563eb"
          trend="+18%"
          trendLabel="24 new verified this week"
        />
        <StatCard
          label="Applications Sent"
          value="8"
          icon={Send}
          color="#0d9488"
          trend="+2"
          trendLabel="4 in active review"
        />
        <StatCard
          label="Interviews Scheduled"
          value="3"
          icon={CalendarCheck}
          color="#7c3aed"
          trend="Upcoming"
          trendLabel="Round 2 Tomorrow 10:30 AM"
        />
        <StatCard
          label="Saved Jobs"
          value={savedJobIds.length.toString()}
          icon={Bookmark}
          color="#ea580c"
          trend="Saved"
          trendLabel="Bookmarked opportunities"
        />
      </div>

      {/* Recommended & Verified Jobs Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Recommended Verified Opportunities
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Handpicked and verified opportunities matching your academic branch and skill profile.
            </p>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {filteredJobs.length} opportunities
          </span>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>No jobs found matching your criteria</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try clearing your filters or searching with different keywords.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.includes(job.id)}
                onToggleSave={handleToggleSave}
                onApply={handleApply}
                onViewDetails={(j) => setActiveModalJob(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={activeModalJob}
        open={Boolean(activeModalJob)}
        onClose={() => setActiveModalJob(null)}
        onApply={handleApply}
        isSaved={activeModalJob && savedJobIds.includes(activeModalJob.id)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
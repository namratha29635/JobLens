import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { initialJobs } from '../../data/mockData';
import { Button, Badge, VerificationBadge, Modal } from '../../components/ui';
import JobDetailsModal from '../../components/ui/JobDetailsModal';
import toast from 'react-hot-toast';

export default function CoordinatorJobPostings() {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New drive form state
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Bangalore / Hybrid',
    ctc: '14.0 LPA',
    type: 'Full-time',
    mode: 'Hybrid',
    deadline: '2026-10-30',
    description: '',
    skills: 'React, Node.js, Python, System Design',
    verificationLevel: 'Level 3',
  });

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePosting = (e) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      toast.error('Please enter the job title and company name');
      return;
    }
    const created = {
      id: `job-${Date.now()}`,
      title: form.title,
      company: form.company,
      location: form.location,
      ctc: form.ctc,
      type: form.type,
      mode: form.mode,
      deadline: form.deadline,
      description: form.description || 'Exciting software engineering role at top tier tech team.',
      skills: form.skills.split(',').map((s) => s.trim()),
      verificationStatus: 'verified',
      verificationLevel: form.verificationLevel,
      isApprovedByCoordinator: true,
      safetyScore: 98,
      responsibilities: ['Build scalable distributed services', 'Collaborate across cross-functional engineering teams'],
      eligibility: { minCgpa: 7.0, branches: ['CSE', 'IT', 'ECE'], maxBacklogs: 0 },
      applicantsCount: 0,
    };
    setJobs([created, ...jobs]);
    setShowCreateModal(false);
    toast.success(`Placement drive for ${form.company} (${form.title}) created and verified!`);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this drive?')) {
      setJobs(jobs.filter((j) => j.id !== id));
      toast.success('Job posting removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase className="text-blue-600" size={26} />
            Campus Placement Drives & Postings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Create, manage, and verify active on-campus & off-campus hiring drives published to student portals.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create Placement Drive
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search drives by company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {filteredJobs.length} Active Placement Drives
        </span>
      </div>

      {/* Drives Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    {job.company?.[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {job.company}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.location}</div>
                  </div>
                </div>

                <VerificationBadge level={job.verificationLevel} />
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {job.title}
              </h4>

              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Compensation (CTC):</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{job.ctc}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} /> {job.applicantsCount || 42} Applicants
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> Deadline: {job.deadline}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <Button size="sm" variant="outline" onClick={() => setSelectedJob(job)}>
                View Drive Details
              </Button>
              <button
                type="button"
                onClick={(e) => handleDelete(job.id, e)}
                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Publish New Campus Hiring Drive
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posting will be authenticated and verified for student applications</div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePosting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon, Google, Razorpay"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Job Role Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer (SDE-1)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Package (CTC) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18.0 LPA"
                    value={form.ctc}
                    onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Job Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship + Full-time">Internship + Full-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Work Mode
                  </label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Location & Office HQ
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Hyderabad / Pune"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, AWS, SQL"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Publish Verified Drive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

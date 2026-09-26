import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { offCampusAPI } from '../../services/api';
import { Card, Badge, Button, Modal, Input, Select, Textarea, EmptyState, LoadingPage, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
const BATCHES = [2026, 2027, 2028, 2029];

const CATEGORY_COLORS = {
  internship: 'primary',
  hackathon: 'purple',
  job: 'success',
  other: 'default',
};

export default function CoordinatorDrives() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await offCampusAPI.getAll({ limit: 50 });
      setDrives(res.data?.data?.drives || []);
    } catch {
      toast.error('Failed to fetch hiring drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this hiring drive?')) return;
    try {
      await offCampusAPI.delete(id);
      toast.success('Drive removed successfully');
      fetchDrives();
    } catch {
      toast.error('Failed to delete drive');
    }
  };

  const filteredDrives = drives.filter((d) => {
    if (categoryFilter && d.driveCategory !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchComp = d.companyName?.toLowerCase().includes(q);
      const matchName = d.driveName?.toLowerCase().includes(q);
      if (!matchComp && !matchName) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
            Off-Campus Hiring Drives
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Publish verified off-campus opportunities, referral drives, and career application links for students
          </p>
        </div>
        <button
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            padding: '10px 22px',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          + Post New Hiring Drive
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-card)',
          padding: '14px 18px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 14px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            minWidth: '240px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            ['', 'All Opportunities'],
            ['job', '💼 Full-Time Jobs'],
            ['internship', '🎓 Internships'],
            ['hackathon', '⚡ Hackathons'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategoryFilter(val)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: categoryFilter === val ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: categoryFilter === val ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: categoryFilter === val ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: categoryFilter === val ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Drives Grid / List */}
      {loading ? (
        <LoadingPage text="Loading hiring drives..." />
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon="🌐"
          title="No Off-Campus Drives Found"
          description="Post a new verified hiring drive for students"
          action={
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                padding: '10px 20px',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + Post Drive Now
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredDrives.map((drive) => (
            <Card
              key={drive._id}
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                      {drive.companyName}
                    </h3>
                    <Badge variant={CATEGORY_COLORS[drive.driveCategory] || 'default'} size="sm">
                      {drive.driveCategory?.toUpperCase() || 'JOB'}
                    </Badge>
                    {drive.isVerified && (
                      <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)', margin: '4px 0 0 0' }}>
                    {drive.driveName}
                  </p>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5, maxWidth: '750px' }}>
                    {drive.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a
                    href={drive.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '6px 14px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Apply Link ↗
                  </a>
                  <button
                    onClick={() => {
                      setSelected(drive);
                      setShowForm(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ✏ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(drive._id)}
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--accent-red)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Badges strip */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span>🎓 Batches: {(drive.eligibleBatches || []).join(', ') || 'All'}</span>
                <span>🏛 Branches: {(drive.eligibleBranches || []).join(', ') || 'All'}</span>
                {drive.lastDateToApply && (
                  <span>📅 Deadline: {new Date(drive.lastDateToApply).toLocaleDateString()}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selected ? `Edit — ${selected.companyName}` : 'Post New Off-Campus Hiring Drive'}
        width="620px"
      >
        <OffCampusForm
          drive={selected}
          onSuccess={() => {
            setShowForm(false);
            fetchDrives();
          }}
        />
      </Modal>
    </div>
  );
}

function OffCampusForm({ drive, onSuccess }) {
  const [form, setForm] = useState({
    companyName: drive?.companyName || '',
    driveName: drive?.driveName || '',
    driveCategory: drive?.driveCategory || 'job',
    applyLink: drive?.applyLink || '',
    description: drive?.description || '',
    lastDateToApply: drive?.lastDateToApply ? drive.lastDateToApply.split('T')[0] : '',
    eligibleBatches: drive?.eligibleBatches || [2026, 2027],
    eligibleBranches: drive?.eligibleBranches || ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'DS'],
  });
  const [loading, setLoading] = useState(false);

  const toggleBatch = (b) => {
    const list = form.eligibleBatches.includes(b)
      ? form.eligibleBatches.filter((x) => x !== b)
      : [...form.eligibleBatches, b];
    setForm({ ...form, eligibleBatches: list });
  };

  const toggleBranch = (br) => {
    const list = form.eligibleBranches.includes(br)
      ? form.eligibleBranches.filter((x) => x !== br)
      : [...form.eligibleBranches, br];
    setForm({ ...form, eligibleBranches: list });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.driveName || !form.applyLink) {
      return toast.error('Please fill company name, job title, and application link');
    }
    if (!form.eligibleBranches.length) {
      return toast.error('Select at least one eligible branch');
    }

    setLoading(true);
    try {
      if (drive) {
        await offCampusAPI.update(drive._id, form);
        toast.success('Hiring drive updated successfully!');
      } else {
        await offCampusAPI.create(form);
        toast.success('Off-campus drive published to students!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save drive');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '9px 12px',
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    fontWeight: 500,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Company Name *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Google, Amazon, Microsoft"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select
            style={inputStyle}
            value={form.driveCategory}
            onChange={(e) => setForm({ ...form, driveCategory: e.target.value })}
          >
            <option value="job">💼 Full-Time Job</option>
            <option value="internship">🎓 Internship</option>
            <option value="hackathon">⚡ Hackathon</option>
            <option value="other">🌐 Other Opportunity</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Job Role / Drive Title *</label>
        <input
          style={inputStyle}
          placeholder="e.g. Software Development Engineer - SDE 1"
          value={form.driveName}
          onChange={(e) => setForm({ ...form, driveName: e.target.value })}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>External Careers Application URL *</label>
        <input
          style={inputStyle}
          placeholder="https://careers.company.com/job/12345"
          value={form.applyLink}
          onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Application Deadline (Optional)</label>
        <input
          type="date"
          style={inputStyle}
          value={form.lastDateToApply}
          onChange={(e) => setForm({ ...form, lastDateToApply: e.target.value })}
        />
      </div>

      {/* Eligible Branches Multi-Select Chips */}
      <div>
        <label style={labelStyle}>Eligible Branches *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {BRANCHES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBranch(b)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: form.eligibleBranches.includes(b) ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: form.eligibleBranches.includes(b) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Eligible Batches */}
      <div>
        <label style={labelStyle}>Eligible Batches</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {BATCHES.map((batch) => (
            <button
              key={batch}
              type="button"
              onClick={() => toggleBatch(batch)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: form.eligibleBatches.includes(batch) ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: form.eligibleBatches.includes(batch) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {batch}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Job Description & Required Tech Stack</label>
        <textarea
          style={{ ...inputStyle, minHeight: '80px' }}
          placeholder="Brief description of requirements, e.g. React, Node.js, Python, AWS, and strong problem solving skills..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 24px',
            background: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading && <Spinner size={14} color="var(--bg-primary)" />}
          {drive ? 'Update Drive' : 'Publish Hiring Drive'}
        </button>
      </div>
    </form>
  );
}

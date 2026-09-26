import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { initialCompanies } from '../../data/mockData';
import { Button, Badge, VerificationBadge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function CoordinatorCompanies() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Technology / Cloud',
    location: '',
    rating: 4.8,
    activeJobs: 1,
    verified: true,
  });

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.location) {
      toast.error('Please enter the company name and headquarters location');
      return;
    }
    const created = {
      id: `comp-${Date.now()}`,
      name: newCompany.name,
      logo: '',
      rating: parseFloat(newCompany.rating),
      reviewsCount: 120,
      activeJobs: parseInt(newCompany.activeJobs, 10),
      verified: true,
      industry: newCompany.industry,
      location: newCompany.location,
    };
    setCompanies([created, ...companies]);
    setShowAddModal(false);
    setNewCompany({ name: '', industry: 'Technology / Cloud', location: '', rating: 4.8, activeJobs: 1, verified: true });
    toast.success(`${newCompany.name} registered and verified successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 className="text-blue-600" size={26} />
            Partner Companies & Recruiters
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Manage campus placement corporate partners, verified recruiter accounts, and hiring statistics.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Partner Company
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search companies by name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {filteredCompanies.length} Registered Recruiters
        </span>
      </div>

      {/* Companies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: 'var(--brand)' }}>
                    {company.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {company.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {company.location}
                    </div>
                  </div>
                </div>

                <VerificationBadge level="Level 3" />
              </div>

              <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', marginBottom: '16px' }}>
                {company.industry}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Student Rating</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" /> {company.rating} / 5.0
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Drives</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand)' }}>
                    {company.activeJobs} Open Roles
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <Button size="sm" variant="outline" style={{ flex: 1 }}>
                View Drives ({company.activeJobs})
              </Button>
              <Button size="sm" variant="secondary" onClick={() => toast.success(`Recruiter contact sheet exported for ${company.name}`)}>
                Recruiter Profile
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Company Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Register Partner Company
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompany} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Company Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cisco Systems, Inc."
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Industry Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fintech / Payments or Software & AI"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Location / HQ
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Register & Verify Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

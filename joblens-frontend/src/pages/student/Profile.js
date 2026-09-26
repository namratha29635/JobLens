import React, { useState } from 'react';
import { studentAPI, openResume, getResumeUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Tabs, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const POPULAR_SKILLS = [
  'Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Express.js', 'MongoDB', 'SQL', 'MySQL', 'PostgreSQL', 'Git', 'GitHub',
  'AWS', 'Docker', 'Machine Learning', 'Data Structures', 'Algorithms',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js', 'FastAPI', 'Spring Boot'
];

export default function StudentProfile() {
  const { profile, refreshProfile, setProfile } = useAuth();
  const [tab, setTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Dedicated sub-section edit states for quick manual entry
  const [editingEducation, setEditingEducation] = useState(false);
  const [savingEducation, setSavingEducation] = useState(false);
  const [eduForm, setEduForm] = useState(null);

  const [editingSkills, setEditingSkills] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [editingCerts, setEditingCerts] = useState(false);
  const [certsText, setCertsText] = useState('');
  const [savingCerts, setSavingCerts] = useState(false);

  const [editingCoding, setEditingCoding] = useState(false);
  const [savingCoding, setSavingCoding] = useState(false);
  const [codingForm, setCodingForm] = useState({
    github: '',
    leetcode: '',
    hackerrank: '',
    codechef: '',
    codeforces: '',
    linkedin: '',
  });

  const startEditCoding = () => {
    setCodingForm({
      github: profile?.codingProfiles?.github || '',
      leetcode: profile?.codingProfiles?.leetcode || '',
      hackerrank: profile?.codingProfiles?.hackerrank || '',
      codechef: profile?.codingProfiles?.codechef || '',
      codeforces: profile?.codingProfiles?.codeforces || '',
      linkedin: profile?.codingProfiles?.linkedin || '',
    });
    setEditingCoding(true);
  };

  const handleSaveCoding = async () => {
    setSavingCoding(true);
    try {
      const res = await studentAPI.updateProfile({
        codingProfiles: codingForm,
      });
      if (res.data?.data) {
        setProfile(res.data.data);
      }
      await refreshProfile();
      setEditingCoding(false);
      toast.success('Coding profiles updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update coding profiles');
    } finally {
      setSavingCoding(false);
    }
  };

  // Initialize Global Edit Form
  const startEdit = () => {
    setForm({
      personalEmail: profile?.personalEmail || '',
      contact: profile?.contact || '',
      address: profile?.address || '',
      profileSummary: profile?.profileSummary || '',
      skills: (profile?.skills || []).join(', '),
      certifications: (profile?.certifications || []).join('\n'),
      academicAchievements: (profile?.academicAchievements || []).join('\n'),
      codingProfiles: {
        github: profile?.codingProfiles?.github || '',
        leetcode: profile?.codingProfiles?.leetcode || '',
        hackerrank: profile?.codingProfiles?.hackerrank || '',
      },
      education: {
        btech: {
          institutionName: profile?.education?.btech?.institutionName || '',
          cgpa: profile?.education?.btech?.cgpa ?? profile?.cgpa ?? '',
          percentage: profile?.education?.btech?.percentage ?? '',
          yearOfCompletion: profile?.education?.btech?.yearOfCompletion ?? profile?.passedOutYear ?? '',
        },
        intermediate: {
          institutionName: profile?.education?.intermediate?.institutionName || '',
          percentage: profile?.education?.intermediate?.percentage ?? '',
          yearOfCompletion: profile?.education?.intermediate?.yearOfCompletion ?? '',
        },
        secondary: {
          institutionName: profile?.education?.secondary?.institutionName || '',
          percentage: profile?.education?.secondary?.percentage ?? '',
          yearOfCompletion: profile?.education?.secondary?.yearOfCompletion ?? '',
        },
      },
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split('\n').map(s => s.trim()).filter(Boolean),
        academicAchievements: form.academicAchievements.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const res = await studentAPI.updateProfile(payload);
      if (res.data?.data) {
        setProfile(res.data.data);
      }
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Dedicated Education Edit
  const startEditEducation = () => {
    setEduForm({
      btech: {
        institutionName: profile?.education?.btech?.institutionName || '',
        cgpa: profile?.education?.btech?.cgpa ?? profile?.cgpa ?? '',
        percentage: profile?.education?.btech?.percentage ?? '',
        yearOfCompletion: profile?.education?.btech?.yearOfCompletion ?? profile?.passedOutYear ?? '',
      },
      intermediate: {
        institutionName: profile?.education?.intermediate?.institutionName || '',
        percentage: profile?.education?.intermediate?.percentage ?? '',
        yearOfCompletion: profile?.education?.intermediate?.yearOfCompletion ?? '',
      },
      secondary: {
        institutionName: profile?.education?.secondary?.institutionName || '',
        percentage: profile?.education?.secondary?.percentage ?? '',
        yearOfCompletion: profile?.education?.secondary?.yearOfCompletion ?? '',
      },
    });
    setEditingEducation(true);
  };

  const handleSaveEducation = async () => {
    setSavingEducation(true);
    try {
      const res = await studentAPI.updateProfile({ education: eduForm });
      if (res.data?.data) {
        setProfile(res.data.data);
      }
      await refreshProfile();
      setEditingEducation(false);
      toast.success('Education details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update education');
    } finally {
      setSavingEducation(false);
    }
  };

  // Dedicated Skills Edit
  const startEditSkills = () => {
    setSkillsList(profile?.skills ? [...profile.skills] : []);
    setNewSkillInput('');
    setEditingSkills(true);
  };

  const addSkill = (skillToAdd) => {
    const val = (skillToAdd || newSkillInput).trim();
    if (!val) return;
    if (skillsList.some(s => s.toLowerCase() === val.toLowerCase())) {
      toast('Skill already added', { icon: 'ℹ️' });
      setNewSkillInput('');
      return;
    }
    setSkillsList(prev => [...prev, val]);
    setNewSkillInput('');
  };

  const removeSkill = (index) => {
    setSkillsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSkills = async () => {
    setSavingSkills(true);
    try {
      const res = await studentAPI.updateProfile({ skills: skillsList });
      if (res.data?.data) {
        setProfile(res.data.data);
      }
      await refreshProfile();
      setEditingSkills(false);
      toast.success('Skills updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  // Dedicated Certifications Edit
  const startEditCerts = () => {
    setCertsText((profile?.certifications || []).join('\n'));
    setEditingCerts(true);
  };

  const handleSaveCerts = async () => {
    setSavingCerts(true);
    try {
      const list = certsText.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await studentAPI.updateProfile({ certifications: list });
      if (res.data?.data) {
        setProfile(res.data.data);
      }
      await refreshProfile();
      setEditingCerts(false);
      toast.success('Certifications updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update certifications');
    } finally {
      setSavingCerts(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return toast.error('Select a PDF file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const res = await studentAPI.uploadResume(fd);
      if (res.data?.data?.student) {
        setProfile(res.data.data.student);
      }
      await refreshProfile();
      setResumeFile(null);
      const parsed = res.data?.data?.parsedDetails;
      const skillsCount = parsed?.skills?.length || 0;
      toast.success(
        skillsCount > 0
          ? `Resume parsed! Auto-extracted ${skillsCount} skills, education & professional details.`
          : 'Resume uploaded and profile details updated successfully!'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading profile...</div>;

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
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  };

  const fieldVal = (label, value) => (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ fontSize: '14px', color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>{value || '—'}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 800, color: 'var(--bg-primary)',
            fontFamily: 'var(--font-display)',
          }}>
            {profile.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>{profile.name}</h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <Badge variant="primary" size="sm">{profile.branch}</Badge>
              <Badge variant="default" size="sm">Batch {profile.passedOutYear}</Badge>
              <Badge variant={profile.cgpa >= 8 ? 'success' : 'warning'} size="sm">CGPA {profile.cgpa}</Badge>
              {profile.activeBacklogs > 0 && <Badge variant="danger" size="sm">{profile.activeBacklogs} Backlog(s)</Badge>}
            </div>
          </div>
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(false)} style={{ padding: '9px 18px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {saving && <Spinner size={14} color="var(--bg-primary)" />}
              Save All Changes
            </button>
          </div>
        ) : (
          <button onClick={startEdit} style={{ padding: '9px 18px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--radius)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ✏ Edit Full Profile
          </button>
        )}
      </div>

      {/* Resume Section */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '4px' }}>📄 Resume</h3>
            {profile.resume?.url ? (
              <p style={{ fontSize: '13px', color: 'var(--accent-green)' }}>
                ✓ Uploaded on {new Date(profile.resume.uploadedAt).toLocaleDateString()}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--accent-red)' }}>⚠ No resume uploaded — required to apply for drives</p>
            )}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tip: You can upload your PDF resume to auto-fill or use the tabs below to manually add/edit education and skills.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {profile.resume?.url && (
              <button
                type="button"
                onClick={() => openResume(profile.resume.url)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                📄 View Resume
              </button>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="file" accept=".pdf" id="resume-upload" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
              <label htmlFor="resume-upload" style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
                {resumeFile ? resumeFile.name.substring(0, 20) + '...' : 'Choose PDF'}
              </label>
              <button onClick={handleResumeUpload} disabled={!resumeFile || uploading}
                style={{ padding: '8px 16px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', cursor: resumeFile ? 'pointer' : 'not-allowed', opacity: !resumeFile || uploading ? 0.6 : 1, fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {uploading && <Spinner size={12} color="var(--bg-primary)" />}
                Upload
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: 'personal', label: '👤 Personal' },
          { value: 'education', label: '🎓 Education' },
          { value: 'professional', label: '🛠 Skills & Career' },
          { value: 'coding', label: '💻 Coding Profiles' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Personal Tab */}
      {tab === 'personal' && (
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {fieldVal('Roll Number', profile.rollNumber)}
            {fieldVal('College Email', profile.collegeEmail)}
            {fieldVal('Branch', profile.branch)}
            {fieldVal('Batch', profile.passedOutYear)}
            {editing ? (
              <>
                <div><label style={labelStyle}>Personal Email</label><input style={inputStyle} value={form.personalEmail} onChange={e => setForm({ ...form, personalEmail: e.target.value })} /></div>
                <div><label style={labelStyle}>Contact</label><input style={inputStyle} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Address</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Profile Summary</label><textarea style={{ ...inputStyle, minHeight: '100px' }} value={form.profileSummary} onChange={e => setForm({ ...form, profileSummary: e.target.value })} /></div>
              </>
            ) : (
              <>
                {fieldVal('Personal Email', profile.personalEmail)}
                {fieldVal('Contact', profile.contact)}
                {profile.address && <div style={{ gridColumn: '1 / -1' }}>{fieldVal('Address', profile.address)}</div>}
                {profile.profileSummary && <div style={{ gridColumn: '1 / -1' }}>{fieldVal('Profile Summary', profile.profileSummary)}</div>}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Education Tab */}
      {tab === 'education' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, margin: 0 }}>
                🎓 Academic Qualifications & Education
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Add or edit your graduation, intermediate/diploma, and secondary school details.
              </p>
            </div>
            {editingEducation ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingEducation(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEducation}
                  disabled={savingEducation}
                  style={{ padding: '8px 18px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {savingEducation && <Spinner size={14} color="var(--bg-primary)" />}
                  💾 Save Education
                </button>
              </div>
            ) : !editing && (
              <button
                type="button"
                onClick={startEditEducation}
                style={{ padding: '8px 16px', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 'var(--radius)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ✏ Edit / Add Education Manually
              </button>
            )}
          </div>

          {[
            { key: 'btech', label: '🎓 B.Tech / Undergrad Degree', showCgpa: true, defaultInst: 'Engineering College' },
            { key: 'intermediate', label: '📚 Intermediate / 12th / Diploma', showCgpa: false, defaultInst: 'Junior College / Polytechnic' },
            { key: 'secondary', label: '🏫 Secondary School (10th / SSC / CBSE)', showCgpa: false, defaultInst: 'High School' },
          ].map(({ key, label, showCgpa, defaultInst }) => {
            const isEditingThis = editing || editingEducation;
            const currentEduState = isEditingThis ? (editing ? form.education[key] : eduForm[key]) : (profile.education?.[key] || {});

            return (
              <Card key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>{label}</h4>
                  {!isEditingThis && !profile.education?.[key]?.institutionName && key !== 'btech' && (
                    <span style={{ fontSize: '12px', color: 'var(--accent-yellow)', background: 'rgba(234, 179, 8, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                      Not yet provided
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {isEditingThis ? (
                    <>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>College / Institution / School Name</label>
                        <input
                          style={inputStyle}
                          placeholder={`e.g. ${defaultInst}`}
                          value={currentEduState.institutionName || ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (editing) {
                              setForm({ ...form, education: { ...form.education, [key]: { ...form.education[key], institutionName: val } } });
                            } else {
                              setEduForm({ ...eduForm, [key]: { ...eduForm[key], institutionName: val } });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Percentage (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 85.5"
                          style={inputStyle}
                          value={currentEduState.percentage ?? ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (editing) {
                              setForm({ ...form, education: { ...form.education, [key]: { ...form.education[key], percentage: val } } });
                            } else {
                              setEduForm({ ...eduForm, [key]: { ...eduForm[key], percentage: val } });
                            }
                          }}
                        />
                      </div>
                      {showCgpa && (
                        <div>
                          <label style={labelStyle}>CGPA (Out of 10)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 8.5"
                            style={inputStyle}
                            value={currentEduState.cgpa ?? ''}
                            onChange={e => {
                              const val = e.target.value;
                              if (editing) {
                                setForm({ ...form, education: { ...form.education, [key]: { ...form.education[key], cgpa: val } } });
                              } else {
                                setEduForm({ ...eduForm, [key]: { ...eduForm[key], cgpa: val } });
                              }
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <label style={labelStyle}>Year of Completion</label>
                        <input
                          type="number"
                          placeholder="e.g. 2026"
                          style={inputStyle}
                          value={currentEduState.yearOfCompletion ?? ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (editing) {
                              setForm({ ...form, education: { ...form.education, [key]: { ...form.education[key], yearOfCompletion: val } } });
                            } else {
                              setEduForm({ ...eduForm, [key]: { ...eduForm[key], yearOfCompletion: val } });
                            }
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ gridColumn: '1 / -1' }}>
                        {fieldVal('Institution / School', profile.education?.[key]?.institutionName || (key === 'btech' ? 'Engineering College' : null))}
                      </div>
                      {fieldVal('Percentage', profile.education?.[key]?.percentage ? `${profile.education[key].percentage}%` : (key === 'btech' && (profile.education?.btech?.cgpa || profile.cgpa) ? `${((profile.education?.btech?.cgpa || profile.cgpa) * 9.5).toFixed(1)}%` : null))}
                      {showCgpa && fieldVal('CGPA', profile.education?.[key]?.cgpa || profile.cgpa)}
                      {fieldVal('Year of Completion', profile.education?.[key]?.yearOfCompletion || (key === 'btech' ? profile.passedOutYear : null))}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Professional & Skills Tab */}
      {tab === 'professional' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Skills Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  🛠 Technical & Core Skills
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {profile.skills?.length || 0} skill(s) listed on your profile
                </p>
              </div>

              {editingSkills ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSkills(false)}
                    style={{ padding: '7px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSkills}
                    disabled={savingSkills}
                    style={{ padding: '7px 16px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {savingSkills && <Spinner size={12} color="var(--bg-primary)" />}
                    💾 Save Skills
                  </button>
                </div>
              ) : !editing && (
                <button
                  type="button"
                  onClick={startEditSkills}
                  style={{ padding: '7px 14px', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 'var(--radius)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ➕ Add / Edit Skills Manually
                </button>
              )}
            </div>

            {/* Editing skills via global form */}
            {editing && (
              <div>
                <label style={labelStyle}>Skills (Comma-separated)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '80px' }}
                  placeholder="e.g. React, Node.js, Python, Java, SQL, Git"
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                />
              </div>
            )}

            {/* Editing skills via dedicated interactive manager */}
            {editingSkills && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Add new skill input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Type a skill name (e.g. React, Python, Docker) & press Enter..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill()}
                    style={{ padding: '9px 18px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    + Add
                  </button>
                </div>

                {/* Popular suggestions pills */}
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Quick Add Popular Skills:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POPULAR_SKILLS.filter(s => !skillsList.some(item => item.toLowerCase() === s.toLowerCase())).slice(0, 15).map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px dashed var(--border)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current interactive skill chips */}
                <div style={{ marginTop: '6px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Your Skills ({skillsList.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {skillsList.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(0,212,255,0.12)',
                          border: '1px solid rgba(0,212,255,0.25)',
                          color: 'var(--accent-primary)',
                          borderRadius: '16px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            lineHeight: 1,
                            padding: '0 2px',
                          }}
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {skillsList.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        No skills added yet. Type a skill above or click quick add tags.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View Mode */}
            {!editing && !editingSkills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(profile.skills || []).map(s => (
                  <Badge key={s} variant="primary" size="sm">{s}</Badge>
                ))}
                {!profile.skills?.length && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '8px', width: '100%' }}>
                    <span style={{ color: 'var(--accent-yellow)', fontSize: '16px' }}>⚠️</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      No skills added yet. Click <strong>"➕ Add / Edit Skills Manually"</strong> or upload your resume above to add skills.
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Certifications Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', margin: 0 }}>🏆 Certifications & Badges</h4>
              {editingCerts ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditingCerts(false)} style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                  <button onClick={handleSaveCerts} disabled={savingCerts} style={{ padding: '6px 14px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Save</button>
                </div>
              ) : !editing && (
                <button onClick={startEditCerts} style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                  ✏ Edit
                </button>
              )}
            </div>

            {editing ? (
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="One certification per line" value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} />
            ) : editingCerts ? (
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="One certification per line" value={certsText} onChange={e => setCertsText(e.target.value)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(profile.certifications || []).map((c, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>✓</span>
                    <span>{c}</span>
                  </div>
                ))}
                {!profile.certifications?.length && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No certifications added</span>}
              </div>
            )}
          </Card>

          {/* Internships Card */}
          {profile.internships?.length > 0 && (
            <Card>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '14px' }}>💼 Internships & Experience</h4>
              {profile.internships.map((intern, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '8px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{intern.role} @ {intern.company}</p>
                  {intern.duration && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{intern.duration}</p>}
                  {intern.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>{intern.description}</p>}
                </div>
              ))}
            </Card>
          )}

          {/* Projects Card */}
          {profile.projects?.length > 0 && (
            <Card>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '14px' }}>🚀 Projects</h4>
              {profile.projects.map((proj, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{proj.title}</p>
                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>View →</a>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {(proj.techStack || []).map(t => <Badge key={t} variant="default" size="sm">{t}</Badge>)}
                  </div>
                  {proj.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>{proj.description}</p>}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Coding Profiles Tab */}
      {tab === 'coding' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                💻 Coding & Developer Profiles
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Add your competitive programming and repository profile links to showcase your coding portfolio to recruiters.
              </p>
            </div>

            {editingCoding ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCoding(false)}
                  style={{ padding: '7px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoding}
                  disabled={savingCoding}
                  style={{ padding: '7px 16px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {savingCoding && <Spinner size={12} color="var(--bg-primary)" />}
                  💾 Save Coding Profiles
                </button>
              </div>
            ) : !editing && (
              <button
                type="button"
                onClick={startEditCoding}
                style={{ padding: '7px 14px', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 'var(--radius)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ✏ Add / Edit Coding Profiles Manually
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'github', icon: '🐙', label: 'GitHub', placeholder: 'https://github.com/username' },
              { key: 'leetcode', icon: '⚡', label: 'LeetCode', placeholder: 'https://leetcode.com/username' },
              { key: 'hackerrank', icon: '🎯', label: 'HackerRank', placeholder: 'https://www.hackerrank.com/profile/username' },
              { key: 'codechef', icon: '👨‍🍳', label: 'CodeChef', placeholder: 'https://www.codechef.com/users/username' },
              { key: 'codeforces', icon: '🏆', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
              { key: 'linkedin', icon: '💼', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/username' },
            ].map(({ key, icon, label, placeholder }) => {
              const isEditingThis = editing || editingCoding;
              const val = isEditingThis ? (editing ? form.codingProfiles[key] : codingForm[key]) : profile.codingProfiles?.[key];

              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px' }}>
                    <span style={{ fontSize: '22px' }}>{icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{label}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    {isEditingThis ? (
                      <input
                        style={inputStyle}
                        placeholder={placeholder}
                        value={val || ''}
                        onChange={e => {
                          const v = e.target.value;
                          if (editing) {
                            setForm({ ...form, codingProfiles: { ...form.codingProfiles, [key]: v } });
                          } else {
                            setCodingForm({ ...codingForm, [key]: v });
                          }
                        }}
                      />
                    ) : val ? (
                      <a
                        href={val.startsWith('http') ? val : `https://${val}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-primary)', fontSize: '13px', textDecoration: 'underline', wordBreak: 'break-all' }}
                      >
                        {val} ↗
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not configured</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
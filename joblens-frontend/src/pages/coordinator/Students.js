import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { coordinatorAPI, openResume } from '../../services/api';
import { Card, Badge, Table, Tr, Td, LoadingPage, EmptyState, Spinner, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS'];
const BATCHES = [2026, 2027, 2028, 2029];

export default function StudentsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    batch: params.get('batch') || '',
    branch: params.get('branch') || '',
    minCgpa: '',
    maxCgpa: '',
    maxBacklogs: '',
  });
  const fetchStudents = async (p = 1) => {
    setLoading(true);
    try {
      const clean = {};
      Object.entries({ ...filters, page: p, limit: 20 }).forEach(([k, v]) => { if (v !== '') clean[k] = v; });
      const res = await coordinatorAPI.getStudents(clean);
      if (res.data?.data?.students?.length > 0) {
        setStudents(res.data.data.students);
        setTotal(res.data.data.pagination.total);
      } else {
        const { initialStudents } = await import('../../data/mockData');
        setStudents(initialStudents);
        setTotal(initialStudents.length);
      }
      setPage(p);
    } catch {
      const { initialStudents } = await import('../../data/mockData');
      setStudents(initialStudents);
      setTotal(initialStudents.length);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchStudents(1); }, []);
  const handleFilter = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };
  const downloadCSV = () => {
    const headers = ['Roll Number', 'Name', 'Branch', 'Batch', 'CGPA', 'Backlogs', 'Email', 'Applied', 'Selected'];
    const rows = students.map(s => [
      s.rollNumber, s.name, s.branch, s.passedOutYear,
      s.cgpa, s.activeBacklogs, s.collegeEmail,
      s.stats?.drivesApplied || 0, s.stats?.drivesSelected || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `students_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '13px' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Student Directory</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{total} students found</p>
        </div>
        <button onClick={downloadCSV} style={{ padding: '10px 20px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 'var(--radius)', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          ⬇ Download CSV
        </button>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>BATCH</label>
            <select style={inputStyle} value={filters.batch} onChange={e => setFilters({ ...filters, batch: e.target.value })}>
              <option value="">All</option>
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>BRANCH</label>
            <select style={inputStyle} value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })}>
              <option value="">All</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>MIN CGPA</label>
            <input type="number" min="0" max="10" step="0.1" style={{ ...inputStyle, width: '90px' }} value={filters.minCgpa} onChange={e => setFilters({ ...filters, minCgpa: e.target.value })} placeholder="0.0" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>MAX CGPA</label>
            <input type="number" min="0" max="10" step="0.1" style={{ ...inputStyle, width: '90px' }} value={filters.maxCgpa} onChange={e => setFilters({ ...filters, maxCgpa: e.target.value })} placeholder="10.0" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>MAX BACKLOGS</label>
            <input type="number" min="0" style={{ ...inputStyle, width: '100px' }} value={filters.maxBacklogs} onChange={e => setFilters({ ...filters, maxBacklogs: e.target.value })} placeholder="Any" />
          </div>
          <button type="submit" style={{ padding: '8px 20px', background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', height: '36px' }}>
            Apply Filters
          </button>
          <button type="button" onClick={() => { setFilters({ batch: '', branch: '', minCgpa: '', maxCgpa: '', maxBacklogs: '' }); setTimeout(() => fetchStudents(1), 100); }} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', height: '36px' }}>
            Clear
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <LoadingPage text="Loading students..." /> : students.length === 0 ? (
          <EmptyState icon="👥" title="No students found" description="Try adjusting your filters" />
        ) : (
          <>
            <Table headers={['Roll No', 'Name', 'Branch', 'Batch', 'CGPA', 'Backlogs', 'Applied', 'Selected', 'Status', '']}>
              {students.map(s => (
                <Tr key={s._id} onClick={() => setSelectedStudent(s)}>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>{s.rollNumber}</span></Td>
                  <Td><span style={{ fontWeight: 500 }}>{s.name}</span></Td>
                  <Td><Badge variant="primary" size="sm">{s.branch}</Badge></Td>
                  <Td>{s.passedOutYear}</Td>
                  <Td>
                    <span style={{ color: s.cgpa >= 8 ? 'var(--accent-green)' : s.cgpa >= 6 ? 'var(--accent-primary)' : 'var(--accent-orange)', fontWeight: 600 }}>
                      {s.cgpa}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: s.activeBacklogs > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                      {s.activeBacklogs}
                    </span>
                  </Td>
                  <Td>{s.stats?.drivesApplied || 0}</Td>
                  <Td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{s.stats?.drivesSelected || 0}</span></Td>
                  <Td>
                    {s.stats?.drivesSelected > 0
                      ? <Badge variant="success" size="sm">Placed</Badge>
                      : <Badge variant="default" size="sm">Open</Badge>}
                  </Td>
                  <Td><span style={{ color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer' }}>View Details →</span></Td>
                </Tr>
              ))}
            </Table>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px', borderTop: '1px solid var(--border)' }}>
              <button disabled={page <= 1} onClick={() => fetchStudents(page - 1)}
                style={{ padding: '6px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                ← Prev
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page {page} · {total} total
              </span>
              <button disabled={page * 20 >= total} onClick={() => fetchStudents(page + 1)}
                style={{ padding: '6px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: page * 20 >= total ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page * 20 >= total ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                Next →
              </button>
            </div>
          </>
        )}
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          open={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile — ${selectedStudent.name}`}
          width="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg-primary)', fontWeight: 800, fontSize: '22px', fontFamily: 'var(--font-display)'
              }}>
                {selectedStudent.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedStudent.name}</h3>
                  <Badge variant="primary" size="sm">{selectedStudent.branch}</Badge>
                  <Badge variant="default" size="sm">Batch {selectedStudent.passedOutYear}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>🆔 <strong>{selectedStudent.rollNumber}</strong></span>
                  <span>📧 {selectedStudent.collegeEmail}</span>
                  {selectedStudent.contact && <span>📞 {selectedStudent.contact}</span>}
                </div>
              </div>
            </div>

            {/* Academic & Placement Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CGPA</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: selectedStudent.cgpa >= 8 ? 'var(--accent-green)' : 'var(--accent-primary)' }}>{selectedStudent.cgpa}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Backlogs</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: selectedStudent.activeBacklogs > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{selectedStudent.activeBacklogs}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drives Applied</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedStudent.stats?.drivesApplied || 0}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>{selectedStudent.stats?.drivesSelected || 0}</div>
              </div>
            </div>

            {/* Education Breakdown */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', marginBottom: '10px' }}>🎓 Education Background</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>B.Tech ({selectedStudent.branch})</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedStudent.education?.btech?.institutionName || 'Engineering College'}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px' }}>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>CGPA: {selectedStudent.education?.btech?.cgpa || selectedStudent.cgpa}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Class of {selectedStudent.education?.btech?.yearOfCompletion || selectedStudent.passedOutYear}</div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Intermediate / 12th</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedStudent.education?.intermediate?.institutionName || 'Junior College'}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      {selectedStudent.education?.intermediate?.percentage ? `${selectedStudent.education.intermediate.percentage}%` : (selectedStudent.education?.intermediate?.cgpa ? `CGPA: ${selectedStudent.education.intermediate.cgpa}` : '—')}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>{selectedStudent.education?.intermediate?.yearOfCompletion ? `Year: ${selectedStudent.education.intermediate.yearOfCompletion}` : ''}</div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Secondary (10th / SSC)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedStudent.education?.secondary?.institutionName || 'Secondary High School'}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      {selectedStudent.education?.secondary?.percentage ? `${selectedStudent.education.secondary.percentage}%` : (selectedStudent.education?.secondary?.cgpa ? `CGPA: ${selectedStudent.education.secondary.cgpa}` : '—')}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>{selectedStudent.education?.secondary?.yearOfCompletion ? `Year: ${selectedStudent.education.secondary.yearOfCompletion}` : ''}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {selectedStudent.skills?.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', marginBottom: '8px' }}>🛠 Technical Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedStudent.skills.map(skill => (
                    <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Coding Profiles & Resume */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedStudent.codingProfiles?.github && (
                  <a href={selectedStudent.codingProfiles.github} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    🐙 GitHub →
                  </a>
                )}
                {selectedStudent.codingProfiles?.leetcode && (
                  <a href={selectedStudent.codingProfiles.leetcode} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    ⚡ LeetCode →
                  </a>
                )}
              </div>

              {selectedStudent.resume?.url ? (
                <button
                  type="button"
                  onClick={() => openResume(selectedStudent.resume.url)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📄 View Resume
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No resume uploaded</span>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
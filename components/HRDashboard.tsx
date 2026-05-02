import React, { useMemo, useState } from 'react';

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
type Status = 'Active' | 'New Hire' | 'Resigned' | 'Dismissed' | 'Redundancy';

type Row = {
  ID: string;
  Name: string;
  Dept: string;
  Q: Quarter;
  Yr: number;
  Status: Status;
  Salary?: number;
  SickDays?: number;
};

const C = {
  bg: '#0d1117',
  surface: '#161b22',
  border: '#21262d',
  text: '#e6edf3',
  sub: '#8b949e',
  teal: '#39d0c4',
  amber: '#f0a830',
  rose: '#f07070',
  blue: '#58a6ff',
};

const SAMPLE_ROWS: Row[] = [
  { ID: 'E001', Name: 'Alice Marsh', Dept: 'Engineering', Q: 'Q1', Yr: 2025, Status: 'Active', Salary: 62000, SickDays: 1 },
  { ID: 'E002', Name: 'Ben Okafor', Dept: 'Engineering', Q: 'Q1', Yr: 2025, Status: 'Active', Salary: 59000, SickDays: 0 },
  { ID: 'E003', Name: 'Chloe Durant', Dept: 'Marketing', Q: 'Q1', Yr: 2025, Status: 'New Hire', Salary: 44000, SickDays: 2 },
  { ID: 'E004', Name: 'David Singh', Dept: 'Finance', Q: 'Q2', Yr: 2025, Status: 'Active', Salary: 51000, SickDays: 1 },
  { ID: 'E005', Name: 'Elena Kovacs', Dept: 'HR', Q: 'Q2', Yr: 2025, Status: 'Resigned', Salary: 42000, SickDays: 4 },
  { ID: 'E006', Name: 'Frank Li', Dept: 'Sales', Q: 'Q3', Yr: 2025, Status: 'New Hire', Salary: 47000, SickDays: 0 },
  { ID: 'E007', Name: 'Grace Nwosu', Dept: 'Engineering', Q: 'Q3', Yr: 2025, Status: 'Dismissed', Salary: 60000, SickDays: 5 },
  { ID: 'E008', Name: 'Hamid Yilmaz', Dept: 'Sales', Q: 'Q4', Yr: 2025, Status: 'Active', Salary: 48500, SickDays: 1 },
  { ID: 'E009', Name: 'Isla MacLeod', Dept: 'Marketing', Q: 'Q4', Yr: 2025, Status: 'Redundancy', Salary: 45500, SickDays: 3 },
];

const isActive = (r: Row): boolean => r.Status === 'Active' || r.Status === 'New Hire';
const isLeaver = (r: Row): boolean => ['Resigned', 'Dismissed', 'Redundancy'].includes(r.Status);

const KPI: React.FC<{ label: string; value: string | number; accent: string }> = ({ label, value, accent }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, minWidth: 170 }}>
    <div style={{ color: accent, fontSize: 24, fontWeight: 700 }}>{value}</div>
    <div style={{ color: C.sub, fontSize: 12 }}>{label}</div>
  </div>
);

/**
 * Clean, compilable subset of the dashboard from the provided snippet.
 * Keeps the same dark visual language and key HR metrics without external chart deps.
 */
const HRDashboard: React.FC = () => {
  const [quarter, setQuarter] = useState<'All' | Quarter>('All');

  const rows = useMemo(
    () => (quarter === 'All' ? SAMPLE_ROWS : SAMPLE_ROWS.filter((r) => r.Q === quarter)),
    [quarter]
  );

  const metrics = useMemo(() => {
    const headcount = rows.filter(isActive).length;
    const leavers = rows.filter(isLeaver).length;
    const newHires = rows.filter((r) => r.Status === 'New Hire').length;
    const avgSalary = headcount
      ? Math.round(rows.filter(isActive).reduce((acc, r) => acc + (r.Salary ?? 0), 0) / headcount)
      : 0;
    const totalSickDays = rows.reduce((acc, r) => acc + (r.SickDays ?? 0), 0);

    return { headcount, leavers, newHires, avgSalary, totalSickDays };
  }, [rows]);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: 20, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>
        HR <span style={{ color: C.teal }}>Quarterly</span> Dashboard
      </h1>
      <p style={{ color: C.sub, marginTop: 6 }}>Cleaned version of the supplied dashboard snippet.</p>

      <div style={{ display: 'flex', gap: 8, margin: '14px 0', flexWrap: 'wrap' }}>
        {(['All', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
          <button
            key={q}
            onClick={() => setQuarter(q)}
            style={{
              border: `1px solid ${quarter === q ? C.teal : C.border}`,
              color: quarter === q ? C.teal : C.sub,
              background: C.surface,
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPI label="Headcount" value={metrics.headcount} accent={C.teal} />
        <KPI label="New Hires" value={metrics.newHires} accent={C.blue} />
        <KPI label="Leavers" value={metrics.leavers} accent={C.rose} />
        <KPI label="Avg Salary" value={`£${metrics.avgSalary.toLocaleString()}`} accent={C.amber} />
        <KPI label="Sickness Days" value={metrics.totalSickDays} accent={C.rose} />
      </div>

      <div style={{ marginTop: 18, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Filtered records ({rows.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['ID', 'Name', 'Dept', 'Quarter', 'Status', 'Salary', 'SickDays'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', borderBottom: `1px solid ${C.border}`, padding: '6px 8px', color: C.sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ID}>
                  <td style={{ padding: '6px 8px' }}>{r.ID}</td>
                  <td style={{ padding: '6px 8px' }}>{r.Name}</td>
                  <td style={{ padding: '6px 8px' }}>{r.Dept}</td>
                  <td style={{ padding: '6px 8px' }}>{r.Q}</td>
                  <td style={{ padding: '6px 8px' }}>{r.Status}</td>
                  <td style={{ padding: '6px 8px' }}>{r.Salary ? `£${r.Salary.toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.SickDays ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

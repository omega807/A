import React, { useMemo, useState } from 'react';

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

type KPI = {
  label: string;
  current: number;
  previous: number;
  target: number;
  suffix?: string;
  positiveDirection: 'up' | 'down';
};

const BASE_KPIS: KPI[] = [
  { label: 'Headcount', current: 420, previous: 401, target: 430, positiveDirection: 'up' },
  { label: 'Voluntary Attrition', current: 2.6, previous: 3.1, target: 2.8, suffix: '%', positiveDirection: 'down' },
  { label: 'Time-to-Fill', current: 34, previous: 41, target: 35, suffix: 'd', positiveDirection: 'down' },
  { label: 'Offer Acceptance', current: 88, previous: 84, target: 85, suffix: '%', positiveDirection: 'up' },
  { label: 'Internal Mobility', current: 4.1, previous: 3.7, target: 4.0, suffix: '%', positiveDirection: 'up' },
  { label: 'Engagement Score', current: 78, previous: 75, target: 77, suffix: '%', positiveDirection: 'up' },
];

const DEPTS = ['All Departments', 'Engineering', 'Sales', 'Marketing', 'Operations'];

const HRDashboard: React.FC = () => {
  const [year, setYear] = useState('2026');
  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [department, setDepartment] = useState(DEPTS[0]);

  const quarterMultiplier = quarter === 'Q1' ? 1 : quarter === 'Q2' ? 1.03 : quarter === 'Q3' ? 1.01 : 1.04;
  const deptMultiplier = department === 'All Departments' ? 1 : department === 'Engineering' ? 1.06 : department === 'Sales' ? 0.98 : department === 'Marketing' ? 1.01 : 0.97;

  const kpis = useMemo(() => {
    return BASE_KPIS.map((kpi) => ({
      ...kpi,
      current: Number((kpi.current * quarterMultiplier * deptMultiplier).toFixed(1)),
      previous: Number((kpi.previous * deptMultiplier).toFixed(1)),
    }));
  }, [quarterMultiplier, deptMultiplier]);

  return (
    <section className="w-full max-w-6xl space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">HR Quarterly Dashboard</h1>
          <p className="text-sm text-gray-400">Simple, interactive KPI cockpit for quarterly people reviews.</p>
        </div>
        <div className="flex gap-3">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-premium-black border border-premium-border rounded-lg px-3 py-2 text-sm">
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
          <select value={quarter} onChange={(e) => setQuarter(e.target.value as Quarter)} className="bg-premium-black border border-premium-border rounded-lg px-3 py-2 text-sm">
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-premium-black border border-premium-border rounded-lg px-3 py-2 text-sm">
            {DEPTS.map((dep) => <option key={dep}>{dep}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const onTarget = kpi.positiveDirection === 'up' ? kpi.current >= kpi.target : kpi.current <= kpi.target;
          return (
            <article key={kpi.label} className="rounded-2xl border border-premium-border bg-premium-dark/70 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-semibold mt-2">{kpi.current}{kpi.suffix ?? ''}</p>
              <p className="text-xs mt-2 text-gray-400">Prev: {kpi.previous}{kpi.suffix ?? ''} • Target: {kpi.target}{kpi.suffix ?? ''}</p>
              <span className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${onTarget ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                {onTarget ? 'On target' : 'Watch'}
              </span>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-premium-border bg-premium-dark/70 p-5 overflow-x-auto">
        <h2 className="text-lg font-semibold">Action Tracker ({quarter} {year})</h2>
        <table className="w-full mt-4 text-sm min-w-[700px]">
          <thead className="text-gray-400">
            <tr className="text-left border-b border-premium-border">
              <th className="py-2">Priority</th><th className="py-2">Owner</th><th className="py-2">KPI Link</th><th className="py-2">Due</th><th className="py-2">Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-premium-border/50"><td className="py-3">Reduce early attrition in Sales</td><td>HRBP</td><td>Voluntary Attrition</td><td>2026-06-30</td><td>-0.6pp attrition</td></tr>
            <tr className="border-b border-premium-border/50"><td className="py-3">Speed up engineering hiring panel</td><td>TA Lead</td><td>Time-to-Fill</td><td>2026-07-15</td><td>-5 days median</td></tr>
            <tr><td className="py-3">Increase manager coaching completion</td><td>L&D Lead</td><td>Engagement</td><td>2026-07-31</td><td>+2pt engagement</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HRDashboard;

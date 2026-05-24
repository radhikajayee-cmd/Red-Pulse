import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import { BarChart2, Download, Loader2, Droplet, Users, Calendar, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#DC2626','#EF4444','#F87171','#FCA5A5','#FDBA74','#FCD34D','#10B981','#3B82F6'];

const Reports = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) setData(res.data);
      } catch (err) {
        showToast('Failed to load report data', 'error');
      } finally { setLoading(false); }
    };
    fetchReports();
  }, []);

  // CSV Export helper
  const exportCSV = (rows, headers, filename) => {
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported successfully!', 'success');
  };

  const exportInventoryCSV = () => {
    if (!data) return;
    exportCSV(data.stockLevels, ['bloodGroup', 'units'], 'blood_inventory_report.csv');
  };

  const exportDonationsCSV = () => {
    if (!data) return;
    exportCSV(data.monthlyDonations, ['month', 'donations'], 'monthly_donations_report.csv');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-hospital-red animate-spin" />
    </div>
  );

  const statsSummary = [
    { label: 'Total Donors', value: data?.stats?.totalDonors ?? 0, icon: <Users className="w-5 h-5 text-hospital-red" />, color: 'bg-red-50 dark:bg-red-950/20' },
    { label: 'Blood Units In Stock', value: data?.stats?.totalBloodUnits ?? 0, icon: <Droplet className="w-5 h-5 text-hospital-red fill-current" />, color: 'bg-red-50 dark:bg-red-950/20' },
    { label: 'Pending Requests', value: data?.stats?.pendingRequests ?? 0, icon: <FileSpreadsheet className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Approved Requests', value: data?.stats?.approvedRequests ?? 0, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">Reports & Analytics</h2>
          <p className="text-xs text-gray-400 mt-0.5">Comprehensive blood bank performance overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportInventoryCSV} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
            <Download className="w-3.5 h-3.5" /> Export Inventory CSV
          </button>
          <button onClick={exportDonationsCSV} className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3">
            <Download className="w-3.5 h-3.5" /> Export Donations CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsSummary.map((s, i) => (
          <div key={i} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <h3 className="text-2xl font-black dark:text-white">{s.value}</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Bar Chart */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm dark:text-white flex items-center gap-2"><Droplet className="w-4 h-4 text-hospital-red fill-current" /> Blood Stock by Group</h4>
            <button onClick={exportInventoryCSV} className="text-[10px] text-hospital-red font-bold hover:underline flex items-center gap-0.5"><Download className="w-3 h-3" /> CSV</button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stockLevels ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="bloodGroup" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                  {(data?.stockLevels ?? []).map((e, i) => <Cell key={i} fill={e.units < 10 ? '#F59E0B' : '#DC2626'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Requested Pie Chart */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm dark:text-white flex items-center gap-2"><BarChart2 className="w-4 h-4 text-hospital-red" /> Most Requested Blood Groups</h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.mostRequested ?? []} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="units" nameKey="bloodGroup" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {(data?.mostRequested ?? []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Donations Area Chart */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm dark:text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-hospital-red" /> Monthly Donation Trends (6 Months)</h4>
          <button onClick={exportDonationsCSV} className="text-[10px] text-hospital-red font-bold hover:underline flex items-center gap-0.5"><Download className="w-3 h-3" /> CSV</button>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyDonations ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              <Area type="monotone" dataKey="donations" stroke="#DC2626" strokeWidth={2.5} fill="url(#gradDon)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alert Table */}
      <div className="glass-card p-5">
        <h4 className="font-bold text-sm mb-4 dark:text-white">Low Stock Alert Details</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="py-2 pr-8 font-semibold">Blood Group</th>
                <th className="py-2 pr-8 font-semibold">Available Units</th>
                <th className="py-2 font-semibold">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {(data?.stockLevels ?? []).map(item => {
                const { badge, label } = item.units === 0 ? { badge: 'bg-red-100 text-red-700', label: 'CRITICAL' } : item.units < 10 ? { badge: 'bg-amber-100 text-amber-700', label: 'LOW' } : item.units < 25 ? { badge: 'bg-blue-100 text-blue-700', label: 'MODERATE' } : { badge: 'bg-emerald-100 text-emerald-700', label: 'ADEQUATE' };
                return (
                  <tr key={item.bloodGroup} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="py-3 font-extrabold text-hospital-red text-sm pr-8">{item.bloodGroup}</td>
                    <td className="py-3 font-semibold dark:text-gray-200 pr-8">{item.units} units</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${badge}`}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import {
  Users,
  Droplet,
  FileText,
  Calendar,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Heart,
  Activity,
  CheckCircle,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // Chart datasets
  const [stockLevels, setStockLevels] = useState([]);
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [mostRequested, setMostRequested] = useState([]);

  // Modal control
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  
  // Hospital Blood Request form states
  const [reqPatientName, setReqPatientName] = useState('');
  const [reqBloodGroup, setReqBloodGroup] = useState('O+');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqEmergency, setReqEmergency] = useState('Normal');
  const [reqPhone, setReqPhone] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const role = user?.role;
      if (role === 'admin') {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setStats(res.data.stats);
          setActivities(res.data.activities);
          setStockLevels(res.data.stockLevels);
          setMonthlyDonations(res.data.monthlyDonations);
          setMostRequested(res.data.mostRequested);
        }
      } else if (role === 'donor') {
        const res = await api.get('/dashboard/donor');
        if (res.data.success) {
          setStats(res.data.stats);
          setActivities(res.data.appointments);
        }
      } else if (role === 'hospital') {
        const res = await api.get('/dashboard/hospital');
        if (res.data.success) {
          setStats(res.data.stats);
          setActivities(res.data.requests);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      showToast('Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Submit Blood Request handler (Hospital quick-action)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqPatientName || !reqPhone || !reqReason || !reqUnits) {
      showToast('Please provide all request fields', 'warning');
      return;
    }

    setSubmittingReq(true);
    try {
      const res = await api.post('/requests', {
        patientName: reqPatientName,
        bloodGroup: reqBloodGroup,
        unitsRequired: Number(reqUnits),
        hospitalName: user?.name,
        emergencyLevel: reqEmergency,
        contactNumber: reqPhone,
        reason: reqReason,
      });

      if (res.data.success) {
        showToast('Blood request submitted successfully!', 'success');
        setRequestModalOpen(false);
        // Reset fields
        setReqPatientName('');
        setReqUnits(1);
        setReqPhone('');
        setReqReason('');
        // Reload dashboard
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit blood request';
      showToast(msg, 'error');
    } finally {
      setSubmittingReq(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="w-12 h-12 text-hospital-red animate-bounce fill-current" />
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  // --- 1. ADMIN DASHBOARD VIEW ---
  if (user?.role === 'admin') {
    const COLORS = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FDBA74', '#FCD34D', '#10B981', '#3B82F6'];

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Donors</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.totalDonors}</h3>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-hospital-red rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-emerald-500">Active Registry</span>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Blood Stock</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.totalBloodUnits} <span className="text-sm font-bold text-gray-400">Units</span></h3>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-hospital-red rounded-xl">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-emerald-500">Available In-House</span>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.pendingRequests}</h3>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-amber-500">Awaiting Approval</span>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.approvedRequests}</h3>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
              <span className="font-semibold text-emerald-500">Disbursed Completed</span>
            </div>
          </div>

          <div className={`glass-card p-5 relative overflow-hidden border ${stats?.lowStockAlerts > 0 ? 'border-amber-250/50 bg-amber-50/5 dark:bg-amber-950/5' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Low Stock Warnings</span>
                <h3 className={`text-2xl font-black mt-1 ${stats?.lowStockAlerts > 0 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'dark:text-white'}`}>
                  {stats?.lowStockAlerts}
                </h3>
              </div>
              <div className={`p-2 rounded-xl ${stats?.lowStockAlerts > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] mt-4">
              <span className={`font-semibold ${stats?.lowStockAlerts > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                {stats?.lowStockAlerts > 0 ? 'Urgent attention required' : 'Stock levels adequate'}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {stats?.lowStockAlerts > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div className="text-xs font-semibold">
              Warning: Some blood groups are below the 10 units threshold! Please check stock levels in the Inventory tab to schedule donor campaigns.
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Levels BarChart */}
          <div className="glass-card p-5 lg:col-span-2">
            <h4 className="font-bold text-sm mb-4 dark:text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-hospital-red fill-current" />
              <span>Blood Group Stock Levels (Units)</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                  <XAxis dataKey="bloodGroup" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.units < 10 ? '#F59E0B' : '#DC2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demand PieChart */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm mb-4 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-hospital-red" />
              <span>Most Demanded Blood Groups</span>
            </h4>
            <div className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mostRequested}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="units"
                    nameKey="bloodGroup"
                  >
                    {mostRequested.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black dark:text-white">Demands</span>
                <span className="text-[10px] font-bold text-gray-400">By Groups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Donation LineChart */}
        <div className="glass-card p-5">
          <h4 className="font-bold text-sm mb-4 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-hospital-red" />
            <span>Monthly Collections Trend (Completed Donations)</span>
          </h4>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyDonations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Area type="monotone" dataKey="donations" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorDonations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="glass-card p-5">
          <h4 className="font-bold text-sm mb-4 dark:text-white">Recent Activities</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 pb-2 text-gray-400 uppercase tracking-wider">
                  <th className="py-2">Activity Description</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Date/Time</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-400">No recent activity logs available.</td>
                  </tr>
                ) : (
                  activities.map((act) => {
                    const typeColors = {
                      request: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
                      appointment: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
                    };

                    const statusColors = {
                      Pending: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
                      Approved: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
                      Completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                      Cancelled: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
                      Rejected: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
                    };

                    return (
                      <tr key={act.id} className="hover:bg-gray-55/20 dark:hover:bg-gray-850/30">
                        <td className="py-3">
                          <h5 className="font-semibold text-gray-800 dark:text-gray-200">{act.title}</h5>
                          <p className="text-[10px] text-gray-400">{act.description}</p>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${typeColors[act.type]}`}>
                            {act.type}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusColors[act.status]}`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. DONOR DASHBOARD VIEW ---
  if (user?.role === 'donor') {
    return (
      <div className="space-y-6">
        {/* Donor Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Eligibility Panel */}
          <div className="glass-card p-6 flex flex-col justify-between lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-red-50/20 to-white dark:from-red-950/5 dark:to-hospital-gray-deep">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hospital-red/5 rounded-full blur-2xl" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
                  stats?.isEligible 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {stats?.isEligible ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base dark:text-white">
                    {stats?.isEligible ? 'You Are Eligible To Donate!' : 'Donation Cooling Period'}
                  </h3>
                  <p className="text-xs text-gray-400">Gap of 90 days is required between donations.</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                {stats?.isEligible
                  ? 'Your physical and history checks show you are fully ready to save lives. Click schedule to choose a slot at our center.'
                  : `Your last donation was on ${new Date(stats?.lastDonation).toLocaleDateString()}. Please wait another ${stats?.daysToNext} days until you can donate whole blood safely.`}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {stats?.isEligible ? (
                <button
                  onClick={() => navigate('/appointments')}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Donation Slot</span>
                </button>
              ) : (
                <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/10">
                  Cooling Down: {stats?.daysToNext} Days Left
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="glass-card p-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center items-center text-center p-4 bg-gray-50 dark:bg-hospital-gray-abyss/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Heart className="w-5 h-5 text-hospital-red fill-current mb-2 animate-pulse-slow" />
              <h4 className="text-2xl font-black dark:text-white">{stats?.totalDonations}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Donations</span>
            </div>
            
            <div className="flex flex-col justify-center items-center text-center p-4 bg-gray-50 dark:bg-hospital-gray-abyss/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Droplet className="w-5 h-5 text-hospital-red mb-2" />
              <h4 className="text-2xl font-black text-hospital-red">{stats?.bloodGroup}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</span>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-4 bg-gray-50 dark:bg-hospital-gray-abyss/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Calendar className="w-5 h-5 text-indigo-500 mb-2" />
              <h4 className="text-2xl font-black dark:text-white">{stats?.pendingAppointments}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Bookings</span>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-4 bg-gray-50 dark:bg-hospital-gray-abyss/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Activity className="w-5 h-5 text-emerald-500 mb-2" />
              <h4 className="text-xs font-black text-emerald-500 capitalize">{stats?.medicalStatus}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medical Status</span>
            </div>
          </div>
        </div>

        {/* Donation Bookings History */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm dark:text-white">Recent Appointments & History</h4>
            <button onClick={() => navigate('/appointments')} className="text-xs text-hospital-red font-bold flex items-center gap-0.5 hover:underline">
              <span>Book Appointment</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-850 pb-2 text-gray-400">
                  <th className="py-2">Date</th>
                  <th className="py-2">Time Slot</th>
                  <th className="py-2">Blood Group</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-400">No appointment records found. Schedule one above!</td>
                  </tr>
                ) : (
                  activities.map((apt) => {
                    const statusColors = {
                      Pending: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
                      Approved: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
                      Completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                      Cancelled: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
                    };

                    return (
                      <tr key={apt._id} className="hover:bg-gray-55/20 dark:hover:bg-gray-850/30">
                        <td className="py-3 font-semibold dark:text-gray-200">
                          {new Date(apt.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{apt.timeSlot}</td>
                        <td className="py-3 text-hospital-red font-bold">{apt.bloodGroup}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusColors[apt.status]}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. HOSPITAL DASHBOARD VIEW ---
  if (user?.role === 'hospital') {
    return (
      <div className="space-y-6">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.totalRequests}</h3>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-hospital-red rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4">Submitted requests</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.pendingRequests}</h3>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4">Awaiting stock deduction</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.approvedRequests}</h3>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4">Stock successfully allocated</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rejected Requests</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.rejectedRequests}</h3>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4">Due to insufficient stock</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Units Demanded</span>
                <h3 className="text-2xl font-black mt-1 dark:text-white">{stats?.totalUnitsRequested}</h3>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-4">Aggregated blood bags</div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="glass-card p-6 flex items-center justify-between bg-gradient-to-r from-red-50/20 to-white dark:from-red-950/5 dark:to-hospital-gray-deep">
          <div>
            <h4 className="font-extrabold text-sm dark:text-white">Emergency Request Center</h4>
            <p className="text-xs text-gray-400 mt-1">Submit immediate blood stock needs for surgery or trauma wards.</p>
          </div>
          <button
            onClick={() => setRequestModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Request Blood Units</span>
          </button>
        </div>

        {/* Recent Blood Requests */}
        <div className="glass-card p-5">
          <h4 className="font-bold text-sm mb-4 dark:text-white">Hospital Request History</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-850 pb-2 text-gray-400">
                  <th className="py-2">Patient Name</th>
                  <th className="py-2">Blood Group</th>
                  <th className="py-2">Units Required</th>
                  <th className="py-2">Emergency Level</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-400">No requests submitted. Click button above to request stock!</td>
                  </tr>
                ) : (
                  activities.map((req) => {
                    const statusColors = {
                      Pending: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
                      Approved: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                      Rejected: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
                    };

                    const levelColors = {
                      Normal: 'text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
                      Urgent: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',
                      Critical: 'text-red-600 bg-red-50 dark:bg-red-950/20 font-extrabold animate-pulse',
                    };

                    return (
                      <tr key={req._id} className="hover:bg-gray-55/20 dark:hover:bg-gray-850/30">
                        <td className="py-3 font-semibold dark:text-gray-200">{req.patientName}</td>
                        <td className="py-3 text-hospital-red font-bold">{req.bloodGroup}</td>
                        <td className="py-3 font-bold dark:text-white">{req.unitsRequired}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${levelColors[req.emergencyLevel]}`}>
                            {req.emergencyLevel}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{req.reason}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusColors[req.status]}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blood Request Modal Form */}
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={() => setRequestModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Form */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-md p-6 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-800 z-10"
            >
              <h3 className="font-extrabold text-base mb-4 dark:text-white">Submit New Blood Request</h3>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                  <input
                    type="text"
                    value={reqPatientName}
                    onChange={(e) => setReqPatientName(e.target.value)}
                    placeholder="Enter full name"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</label>
                    <select
                      value={reqBloodGroup}
                      onChange={(e) => setReqBloodGroup(e.target.value)}
                      className="input-field font-bold text-hospital-red"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(grp => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Units Required</label>
                    <input
                      type="number"
                      value={reqUnits}
                      onChange={(e) => setReqUnits(e.target.value)}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Emergency Level</label>
                    <select
                      value={reqEmergency}
                      onChange={(e) => setReqEmergency(e.target.value)}
                      className="input-field"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
                    <input
                      type="text"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      placeholder="+1 (555) 0122"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reason / Diagnosis</label>
                  <textarea
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="E.g., Heart surgery, internal bleeding"
                    className="input-field h-20 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    {submittingReq && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Dashboard;

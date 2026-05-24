import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import { FileText, Plus, Search, Filter, CheckCircle, X, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const BloodRequests = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [approving, setApproving] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isHospital = user?.role === 'hospital';

  const emptyForm = { patientName: '', bloodGroup: 'O+', unitsRequired: 1, hospitalName: user?.name || '', emergencyLevel: 'Normal', contactNumber: '', reason: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (groupFilter) params.bloodGroup = groupFilter;

      const endpoint = isAdmin ? '/requests' : '/requests/hospital';
      const res = await api.get(endpoint, { params });
      if (res.data.success) setRequests(res.data.requests);
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally { setLoading(false); }
  }, [statusFilter, groupFilter, isAdmin]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id, status) => {
    setApproving(id + status);
    try {
      const res = await api.put(`/requests/${id}/status`, { status });
      if (res.data.success) {
        showToast(`Request ${status.toLowerCase()} successfully`, status === 'Approved' ? 'success' : 'error');
        fetchRequests();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally { setApproving(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/requests', { ...form, unitsRequired: Number(form.unitsRequired) });
      if (res.data.success) {
        showToast('Blood request submitted!', 'success');
        setModalOpen(false);
        setForm(emptyForm);
        fetchRequests();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  const statusConfig = {
    Pending:  { icon: <Clock className="w-3.5 h-3.5" />,        cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/20' },
    Approved: { icon: <CheckCircle className="w-3.5 h-3.5" />,  cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/20' },
    Rejected: { icon: <X className="w-3.5 h-3.5" />,            cls: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/20' },
  };
  const levelCls = { Normal: 'text-gray-500 bg-gray-50 dark:bg-gray-800', Urgent: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20', Critical: 'text-red-600 bg-red-50 dark:bg-red-950/20 font-extrabold animate-pulse' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">Blood Requests</h2>
          <p className="text-xs text-gray-400 mt-0.5">{requests.length} total requests</p>
        </div>
        {isHospital && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 self-start">
            <Plus className="w-4 h-4" /><span>New Request</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36 text-xs">
          <option value="">All Statuses</option>
          {['Pending','Approved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="input-field w-36 text-xs">
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {(statusFilter || groupFilter) && (
          <button onClick={() => { setStatusFilter(''); setGroupFilter(''); }} className="text-xs text-gray-500 hover:text-hospital-red flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>
        )}
      </div>

      {/* Requests Cards / Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-hospital-red animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-3">
          <FileText className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-400">No blood requests found</p>
          {isHospital && <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">Submit First Request</button>}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-hospital-gray-abyss/30">
                <tr className="text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Hospital</th>
                  <th className="px-5 py-3 font-semibold">Blood / Units</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  {isAdmin && <th className="px-5 py-3 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {requests.map(req => {
                  const sc = statusConfig[req.status] || statusConfig.Pending;
                  return (
                    <motion.tr key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold dark:text-gray-200">{req.patientName}</p>
                        <p className="text-[10px] text-gray-400">{req.contactNumber}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">{req.hospitalName}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-hospital-red text-sm">{req.bloodGroup}</span>
                        <span className="text-gray-400 ml-1">× {req.unitsRequired} units</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${levelCls[req.emergencyLevel]}`}>{req.emergencyLevel}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-32 truncate">{req.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${sc.cls}`}>
                          {sc.icon}{req.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          {req.status === 'Pending' ? (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleApprove(req._id, 'Approved')} disabled={approving === req._id+'Approved'} className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 flex items-center gap-1 transition-colors">
                                {approving === req._id+'Approved' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                              </button>
                              <button onClick={() => handleApprove(req._id, 'Rejected')} disabled={approving === req._id+'Rejected'} className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 flex items-center gap-1 transition-colors">
                                {approving === req._id+'Rejected' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No action needed</span>
                          )}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-md p-6 rounded-3xl shadow-2xl border dark:border-gray-800 z-10">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-base dark:text-white">New Blood Request</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 dark:text-gray-300" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={form.patientName} onChange={e => setForm(p => ({...p, patientName: e.target.value}))} placeholder="Patient full name" className="input-field text-xs" required />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</label>
                    <select value={form.bloodGroup} onChange={e => setForm(p => ({...p, bloodGroup: e.target.value}))} className="input-field text-xs font-bold text-hospital-red">
                      {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Units Required</label>
                    <input type="number" value={form.unitsRequired} onChange={e => setForm(p => ({...p, unitsRequired: e.target.value}))} className="input-field text-xs" min="1" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Emergency Level</label>
                    <select value={form.emergencyLevel} onChange={e => setForm(p => ({...p, emergencyLevel: e.target.value}))} className="input-field text-xs">
                      {['Normal','Urgent','Critical'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Number</label>
                    <input type="text" value={form.contactNumber} onChange={e => setForm(p => ({...p, contactNumber: e.target.value}))} placeholder="+1 (555) 0100" className="input-field text-xs" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Reason / Diagnosis</label>
                  <textarea value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="Briefly describe the medical need" className="input-field text-xs h-20 resize-none" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-xs py-2.5">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodRequests;

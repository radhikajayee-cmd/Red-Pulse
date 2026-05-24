import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import { Calendar, Plus, CheckCircle, X, Clock, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const TIME_SLOTS = ['08:00 AM - 09:00 AM','09:00 AM - 10:00 AM','10:00 AM - 11:00 AM','11:00 AM - 12:00 PM','01:00 PM - 02:00 PM','02:00 PM - 03:00 PM','03:00 PM - 04:00 PM','04:00 PM - 05:00 PM'];

const Appointments = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDonor = user?.role === 'donor';

  const emptyForm = {
    donorName: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', bloodGroup: 'O+', date: '', timeSlot: TIME_SLOTS[0]
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const endpoint = isAdmin ? '/appointments' : '/appointments/my-appointments';
      const res = await api.get(endpoint, { params });
      if (res.data.success) setAppointments(res.data.appointments);
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally { setLoading(false); }
  }, [isAdmin, statusFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.date) { showToast('Please select a date', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/appointments', form);
      if (res.data.success) {
        showToast('Appointment booked successfully!', 'success');
        setModalOpen(false);
        setForm(emptyForm);
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      const res = await api.put(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        showToast(`Appointment marked as ${status}`, 'success');
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setUpdating(null); }
  };

  const statusConfig = {
    Pending:   { cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',   icon: <Clock className="w-3.5 h-3.5" /> },
    Approved:  { cls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    Completed: { cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20', icon: <Heart className="w-3.5 h-3.5 fill-current" /> },
    Cancelled: { cls: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20',       icon: <X className="w-3.5 h-3.5" /> },
  };

  // Today's minimum date for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">Donation Appointments</h2>
          <p className="text-xs text-gray-400 mt-0.5">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} on record</p>
        </div>
        {isDonor && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 self-start">
            <Plus className="w-4 h-4" /><span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* Filter */}
      {isAdmin && (
        <div className="glass-card p-4 flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-40 text-xs">
            <option value="">All Statuses</option>
            {['Pending','Approved','Completed','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {statusFilter && <button onClick={() => setStatusFilter('')} className="text-xs text-gray-500 hover:text-hospital-red flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-hospital-red animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-3">
          <Calendar className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-400">{isDonor ? 'No appointments booked yet' : 'No appointments found'}</p>
          {isDonor && <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">Book Your First Slot</button>}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-hospital-gray-abyss/30">
                <tr className="text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3 font-semibold">Donor Name</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Blood Group</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time Slot</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  {isAdmin && <th className="px-5 py-3 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {appointments.map(apt => {
                  const sc = statusConfig[apt.status] || statusConfig.Pending;
                  return (
                    <motion.tr key={apt._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-hospital-red/10 text-hospital-red font-bold flex items-center justify-center text-xs">{apt.donorName?.charAt(0)}</div>
                          <span className="font-semibold dark:text-gray-200">{apt.donorName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{apt.phone}</td>
                      <td className="px-5 py-3.5 font-extrabold text-hospital-red">{apt.bloodGroup}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 font-medium">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{apt.timeSlot}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${sc.cls}`}>{sc.icon}{apt.status}</span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5 justify-end flex-wrap">
                            {apt.status === 'Pending' && (
                              <button onClick={() => handleUpdateStatus(apt._id, 'Approved')} disabled={!!updating} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                {updating === apt._id+'Approved' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                              </button>
                            )}
                            {apt.status === 'Approved' && (
                              <button onClick={() => handleUpdateStatus(apt._id, 'Completed')} disabled={!!updating} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                {updating === apt._id+'Completed' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />} Complete
                              </button>
                            )}
                            {(apt.status === 'Pending' || apt.status === 'Approved') && (
                              <button onClick={() => handleUpdateStatus(apt._id, 'Cancelled')} disabled={!!updating} className="px-2 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors flex items-center gap-1">
                                {updating === apt._id+'Cancelled' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Cancel
                              </button>
                            )}
                            {(apt.status === 'Completed' || apt.status === 'Cancelled') && (
                              <span className="text-[10px] text-gray-400 italic">Finalised</span>
                            )}
                          </div>
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

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-md p-6 rounded-3xl shadow-2xl border dark:border-gray-800 z-10">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-base dark:text-white">Book Donation Slot</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 dark:text-gray-300" /></button>
              </div>
              <form onSubmit={handleBook} className="space-y-3">
                {[['donorName','Donor Name','text','Full Name'], ['email','Email','email','you@email.com'], ['phone','Phone','text','+1 (555) 0100']].map(([key, label, type, ph]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} placeholder={ph} className="input-field text-xs" required />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</label>
                    <select value={form.bloodGroup} onChange={e => setForm(p => ({...p, bloodGroup: e.target.value}))} className="input-field text-xs font-bold text-hospital-red">
                      {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="input-field text-xs" min={today} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Slot</label>
                  <select value={form.timeSlot} onChange={e => setForm(p => ({...p, timeSlot: e.target.value}))} className="input-field text-xs">
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-xs py-2.5">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Booking
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

export default Appointments;

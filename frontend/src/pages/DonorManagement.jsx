import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import { Users, Plus, Search, Edit2, Trash2, X, Loader2, Filter, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  name: '', email: '', phone: '', age: '', gender: 'Male',
  bloodGroup: 'O+', address: '', medicalStatus: 'Healthy', lastDonationDate: ''
};

const DonorManagement = () => {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewDonor, setViewDonor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterBlood) params.bloodGroup = filterBlood;
      if (filterGender) params.gender = filterGender;
      const res = await api.get('/donors', { params });
      if (res.data.success) setDonors(res.data.donors);
    } catch (err) {
      showToast('Failed to load donors', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterBlood, filterGender]);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (donor) => {
    setForm({
      name: donor.name, email: donor.email, phone: donor.phone,
      age: donor.age, gender: donor.gender, bloodGroup: donor.bloodGroup,
      address: donor.address, medicalStatus: donor.medicalStatus || 'Healthy',
      lastDonationDate: donor.lastDonationDate ? donor.lastDonationDate.split('T')[0] : ''
    });
    setEditingId(donor._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.age || !form.address) {
      showToast('Please fill all required fields', 'warning'); return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/donors/${editingId}`, form);
        if (res.data.success) { showToast('Donor updated successfully', 'success'); setModalOpen(false); fetchDonors(); }
      } else {
        const res = await api.post('/donors', form);
        if (res.data.success) { showToast('Donor added successfully', 'success'); setModalOpen(false); fetchDonors(); }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete donor "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await api.delete(`/donors/${id}`);
      if (res.data.success) { showToast('Donor deleted successfully', 'success'); fetchDonors(); }
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const bloodBadge = (bg) => {
    const colors = { 'O-': 'bg-purple-100 text-purple-700', 'O+': 'bg-red-100 text-red-700', 'A+': 'bg-rose-100 text-rose-700', 'A-': 'bg-pink-100 text-pink-700', 'B+': 'bg-orange-100 text-orange-700', 'B-': 'bg-amber-100 text-amber-700', 'AB+': 'bg-indigo-100 text-indigo-700', 'AB-': 'bg-blue-100 text-blue-700' };
    return colors[bg] || 'bg-gray-100 text-gray-700';
  };

  const statusColors = { 'Healthy': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20', 'On Medication': 'text-amber-600 bg-amber-50 dark:bg-amber-950/20', 'Underweight': 'text-rose-600 bg-rose-50 dark:bg-rose-950/20', 'Recent Surgery': 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' };

  const totalPages = Math.ceil(donors.length / PER_PAGE);
  const paginated = donors.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">Donor Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">{donors.length} registered donors in the system</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /><span>Add New Donor</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by name, email, phone..." className="input-field pl-9 py-2 text-xs" />
        </div>
        <select value={filterBlood} onChange={e => { setFilterBlood(e.target.value); setCurrentPage(1); }} className="input-field w-36 text-xs">
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterGender} onChange={e => { setFilterGender(e.target.value); setCurrentPage(1); }} className="input-field w-32 text-xs">
          <option value="">All Genders</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {(search || filterBlood || filterGender) && (
          <button onClick={() => { setSearch(''); setFilterBlood(''); setFilterGender(''); }} className="text-xs text-gray-500 hover:text-hospital-red flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-hospital-red animate-spin" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-400">No donors found</p>
            <button onClick={openAdd} className="btn-primary text-xs">Add First Donor</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-hospital-gray-abyss/30">
                <tr className="text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3 font-semibold">Donor</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Blood Group</th>
                  <th className="px-5 py-3 font-semibold">Age / Gender</th>
                  <th className="px-5 py-3 font-semibold">Last Donation</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {paginated.map((donor) => (
                  <motion.tr key={donor._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-hospital-red/10 text-hospital-red font-bold flex items-center justify-center text-sm">{donor.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold dark:text-gray-200">{donor.name}</p>
                          <p className="text-[10px] text-gray-400">{donor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{donor.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${bloodBadge(donor.bloodGroup)}`}>{donor.bloodGroup}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{donor.age} yrs / {donor.gender}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${statusColors[donor.medicalStatus] || 'text-gray-500 bg-gray-50'}`}>{donor.medicalStatus || 'Healthy'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => { setViewDonor(donor); setViewModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/20 text-sky-500 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(donor)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(donor._id, donor.name)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded-lg text-xs font-bold ${p === currentPage ? 'bg-hospital-red text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-800 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-base dark:text-white">{editingId ? 'Edit Donor Profile' : 'Add New Donor'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 dark:text-gray-300" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[['name','Full Name','text','John Doe'],['email','Email','email','john@example.com'],['phone','Phone','text','+1 (555) 0100'],['age','Age','number','28']].map(([key,label,type,ph]) => (
                    <div key={key} className={`space-y-1 ${key === 'name' || key === 'email' ? 'col-span-2' : ''}`}>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                      <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} placeholder={ph} className="input-field text-xs" required />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                    <select value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))} className="input-field text-xs">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</label>
                    <select value={form.bloodGroup} onChange={e => setForm(p => ({...p, bloodGroup: e.target.value}))} className="input-field text-xs font-bold text-hospital-red">
                      {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                    <input type="text" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="City, State" className="input-field text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Donation</label>
                    <input type="date" value={form.lastDonationDate} onChange={e => setForm(p => ({...p, lastDonationDate: e.target.value}))} className="input-field text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medical Status</label>
                    <select value={form.medicalStatus} onChange={e => setForm(p => ({...p, medicalStatus: e.target.value}))} className="input-field text-xs">
                      {['Healthy', 'On Medication', 'Underweight', 'Recent Surgery'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingId ? 'Update Donor' : 'Add Donor'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Donor Modal */}
      <AnimatePresence>
        {viewModalOpen && viewDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-md p-6 rounded-3xl shadow-2xl border dark:border-gray-800 z-10">
              <button onClick={() => setViewModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 dark:text-gray-300" /></button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-hospital-red/10 text-hospital-red text-2xl font-black flex items-center justify-center">{viewDonor.name.charAt(0)}</div>
                <div>
                  <h3 className="font-extrabold text-base dark:text-white">{viewDonor.name}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${bloodBadge(viewDonor.bloodGroup)}`}>{viewDonor.bloodGroup}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {[['Email', viewDonor.email], ['Phone', viewDonor.phone], ['Age', `${viewDonor.age} years`], ['Gender', viewDonor.gender], ['Address', viewDonor.address], ['Medical Status', viewDonor.medicalStatus || 'Healthy'], ['Last Donation', viewDonor.lastDonationDate ? new Date(viewDonor.lastDonationDate).toLocaleDateString() : 'Never']].map(([label, val]) => (
                  <div key={label} className={label === 'Address' || label === 'Email' ? 'col-span-2' : ''}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold dark:text-gray-200">{val}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonorManagement;

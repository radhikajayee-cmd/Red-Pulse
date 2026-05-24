import React, { useState, useEffect } from 'react';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import { Droplet, RefreshCw, AlertTriangle, Plus, Minus, Edit2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const InventoryManagement = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [action, setAction] = useState('add');
  const [units, setUnits] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      if (res.data.success) setInventory(res.data.inventory);
    } catch (err) {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const openUpdate = (bloodGroup, act) => {
    setSelectedGroup(bloodGroup);
    setAction(act);
    setUnits('');
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!units || Number(units) <= 0) { showToast('Enter a valid unit count', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/inventory/update', { bloodGroup: selectedGroup, units: Number(units), action });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setModalOpen(false);
        fetchInventory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSubmitting(false); }
  };

  const getStockColor = (units) => {
    if (units === 0) return { bar: '#EF4444', badge: 'bg-red-100 text-red-700 dark:bg-red-950/30', label: 'CRITICAL', border: 'border-red-200 dark:border-red-900/30' };
    if (units < 10) return { bar: '#F59E0B', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30', label: 'LOW', border: 'border-amber-200 dark:border-amber-900/30' };
    if (units < 25) return { bar: '#3B82F6', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30', label: 'MODERATE', border: 'border-blue-200' };
    return { bar: '#10B981', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30', label: 'ADEQUATE', border: 'border-emerald-200' };
  };

  const totalUnits = inventory.reduce((s, i) => s + (i.units || 0), 0);
  const lowStockCount = inventory.filter(i => i.units < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold dark:text-white">Blood Inventory</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total: <span className="font-bold text-hospital-red">{totalUnits} units</span> across all groups</p>
        </div>
        <button onClick={fetchInventory} className="btn-secondary text-xs flex items-center gap-1.5 self-start"><RefreshCw className="w-4 h-4" /><span>Refresh Stock</span></button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            {lowStockCount} blood group{lowStockCount > 1 ? 's are' : ' is'} critically low (below 10 units). Immediate donor outreach recommended.
          </p>
        </div>
      )}

      {/* Stock Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-hospital-red animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((grp) => {
            const item = inventory.find(i => i.bloodGroup === grp) || { bloodGroup: grp, units: 0 };
            const { badge, label, border } = getStockColor(item.units);
            const pct = Math.min(100, Math.round((item.units / 50) * 100));
            return (
              <motion.div key={grp} whileHover={{ scale: 1.02 }} className={`glass-card p-5 border ${border} flex flex-col gap-3`}>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-hospital-red/10 text-hospital-red flex items-center justify-center font-extrabold text-lg">{grp}</div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge}`}>{label}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black dark:text-white">{item.units}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold">UNITS IN STOCK</p>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-hospital-red transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openUpdate(grp, 'add')} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                  <button onClick={() => openUpdate(grp, 'remove')} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors">
                    <Minus className="w-3 h-3" /> Remove
                  </button>
                  <button onClick={() => openUpdate(grp, 'set')} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center gap-1 transition-colors">
                    <Edit2 className="w-3 h-3" /> Set
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bar Chart */}
      <div className="glass-card p-5">
        <h4 className="font-bold text-sm mb-5 dark:text-white flex items-center gap-2"><Droplet className="w-4 h-4 text-hospital-red fill-current" /> Stock Levels Overview</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="bloodGroup" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} cursor={{ fill: 'rgba(220,38,38,0.05)' }} />
              <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                {inventory.map((entry, i) => <Cell key={i} fill={getStockColor(entry.units).bar} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-hospital-gray-deep w-full max-w-sm p-6 rounded-3xl shadow-2xl border dark:border-gray-800 z-10">
              <h3 className="font-extrabold text-base mb-1 dark:text-white capitalize">
                {action === 'add' ? 'Add Units To' : action === 'remove' ? 'Remove Units From' : 'Set Stock For'} <span className="text-hospital-red">{selectedGroup}</span>
              </h3>
              <p className="text-xs text-gray-400 mb-5">Current stock: <span className="font-bold dark:text-gray-200">{inventory.find(i => i.bloodGroup === selectedGroup)?.units ?? 0} units</span></p>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Number of Units</label>
                  <input type="number" value={units} onChange={e => setUnits(e.target.value)} placeholder="e.g. 10" className="input-field" min="1" required />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-xs py-2.5">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Confirm
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

export default InventoryManagement;

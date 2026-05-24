import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, ShieldCheck, Droplet, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile(profileForm);
    setSavingProfile(false);
    showToast(result.message || (result.success ? 'Profile updated!' : 'Update failed'), result.success ? 'success' : 'error');
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning'); return;
    }
    setSavingPw(true);
    const result = await changePassword(pwForm.currentPassword, pwForm.newPassword);
    setSavingPw(false);
    showToast(result.message || (result.success ? 'Password changed!' : 'Change failed'), result.success ? 'success' : 'error');
    if (result.success) setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const roleConfig = {
    admin:    { label: 'System Administrator', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20', icon: <ShieldCheck className="w-4 h-4" /> },
    donor:    { label: 'Blood Donor',           color: 'text-hospital-red bg-red-50 dark:bg-red-950/20',     icon: <Heart className="w-4 h-4 fill-current" /> },
    hospital: { label: 'Partner Hospital',      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20', icon: <Droplet className="w-4 h-4" /> },
  };
  const rc = roleConfig[user?.role] || roleConfig.admin;

  const donorInfo = user?.donorProfile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-hospital-red text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold dark:text-white truncate">{user?.name}</h2>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mt-2 ${rc.color}`}>
              {rc.icon} {rc.label}
            </span>
          </div>
        </div>

        {/* Donor extra info */}
        {user?.role === 'donor' && donorInfo && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Blood Group', donorInfo.bloodGroup, 'text-hospital-red font-extrabold text-lg'],
              ['Age', `${donorInfo.age} yrs`, 'dark:text-gray-200 font-bold'],
              ['Gender', donorInfo.gender, 'dark:text-gray-200 font-bold'],
              ['Medical Status', donorInfo.medicalStatus || 'Healthy', 'text-emerald-600 font-bold'],
            ].map(([label, val, cls]) => (
              <div key={label} className="text-center p-3 bg-gray-50 dark:bg-hospital-gray-abyss/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-sm ${cls}`}>{val}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Profile Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-bold text-sm mb-5 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-hospital-red" /> Edit Profile
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="input-field pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={user?.email || ''}
                className="input-field pl-10 opacity-60 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-[10px] text-gray-400">Email cannot be changed after registration.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="+1 (555) 0100"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile} className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5">
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>

      {/* Change Password Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h3 className="font-bold text-sm mb-5 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-hospital-red" /> Change Password
        </h3>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            ['currentPassword', 'Current Password', 'Enter current password'],
            ['newPassword', 'New Password', 'Enter new password (min. 6 chars)'],
            ['confirmPassword', 'Confirm New Password', 'Re-enter new password'],
          ].map(([key, label, ph]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  className="input-field pl-10"
                  placeholder={ph}
                  required
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw} className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5">
              {savingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Update Password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;

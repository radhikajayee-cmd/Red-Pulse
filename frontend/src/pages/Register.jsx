import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import { Heart, User, Building, Mail, Lock, Phone, MapPin, Calendar, HeartPulse, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('donor'); // 'donor' or 'hospital'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Donor-specific fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [medicalStatus, setMedicalStatus] = useState('Healthy');
  
  const [loading, setLoading] = useState(false);

  // Read URL query params for initial role selection
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['donor', 'hospital'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !address) {
      showToast('Please fill in all core fields', 'warning');
      return;
    }

    // Donor validation
    if (role === 'donor') {
      if (!age) {
        showToast('Please provide your age', 'warning');
        return;
      }
      if (Number(age) < 18 || Number(age) > 65) {
        showToast('Donors must be between 18 and 65 years old', 'error');
        return;
      }
    }

    const payload = {
      name,
      email,
      password,
      role,
      phone,
      address,
      ...(role === 'donor' && {
        age: Number(age),
        gender,
        bloodGroup,
        lastDonationDate: lastDonationDate || null,
        medicalStatus,
      }),
    };

    setLoading(true);
    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      showToast('Registration successful! Welcome.', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-hospital-gray-abyss flex items-center justify-center p-6 py-16 transition-colors duration-300">
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-hospital-red flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold text-lg text-hospital-gray-deep dark:text-white">LifeFlow</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white dark:bg-hospital-gray-deep rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-hospital-red/5 rounded-full blur-xl" />

        <div className="space-y-2 text-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight dark:text-white font-sans">Create an Account</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Join our blood bank registry network</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-gray-55 dark:bg-hospital-gray-abyss p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === 'donor'
                ? 'bg-white dark:bg-hospital-gray-deep text-hospital-red shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Blood Donor</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === 'hospital'
                ? 'bg-white dark:bg-hospital-gray-deep text-hospital-red shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Partner Hospital</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {role === 'donor' ? 'Full Name' : 'Hospital Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'donor' ? 'John Doe' : 'City Central Hospital'}
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 0100"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Street Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, State, Zip"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* Donor-Specific Fields with slide-down animation */}
          <AnimatePresence initial={false}>
            {role === 'donor' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="input-field"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input-field"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="input-field font-bold text-hospital-red"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(grp => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Last Donation Date</span>
                    </label>
                    <input
                      type="date"
                      value={lastDonationDate}
                      onChange={(e) => setLastDonationDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-gray-400" />
                      <span>Medical Status</span>
                    </label>
                    <select
                      value={medicalStatus}
                      onChange={(e) => setMedicalStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="Healthy">Healthy & Eligible</option>
                      <option value="On Medication">On Medication</option>
                      <option value="Underweight">Underweight (&lt; 50kg)</option>
                      <option value="Recent Surgery">Recent Surgery (&lt; 6 months)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-hospital-red font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

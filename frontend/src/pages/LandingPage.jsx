import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, Droplet, Shield, Award, Users, Check, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');

  // Handle smooth scroll & track active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'awareness', 'stats', 'testimonials'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const statItems = [
    { count: '1,240+', label: 'Registered Donors', icon: <Users className="w-5 h-5 text-hospital-red" /> },
    { count: '480+', label: 'Blood Units Saved', icon: <Droplet className="w-5 h-5 text-hospital-red" /> },
    { count: '18+', label: 'Partner Hospitals', icon: <Activity className="w-5 h-5 text-hospital-red" /> },
    { count: '98%', label: 'Request Success Rate', icon: <Shield className="w-5 h-5 text-hospital-red" /> },
  ];

  const compatibilityData = [
    { type: 'O-', canGive: 'Everyone (Universal)', canReceive: 'O-' },
    { type: 'O+', canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-' },
    { type: 'A-', canGive: 'A+, A-, AB+, AB-', canReceive: 'A-, O-' },
    { type: 'A+', canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-' },
    { type: 'B-', canGive: 'B+, B-, AB+, AB-', canReceive: 'B-, O-' },
    { type: 'B+', canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-' },
    { type: 'AB-', canGive: 'AB+, AB-', canReceive: 'AB-, A-, B-, O-' },
    { type: 'AB+', canGive: 'AB+ (Universal Recipient)', canReceive: 'Everyone' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-hospital-gray-abyss text-hospital-gray-deep dark:text-gray-100 font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-hospital-gray-abyss/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-hospital-red flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Heart className="w-6 h-6 fill-current animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-none tracking-tight dark:text-white">LifeFlow</h1>
              <span className="text-xs text-hospital-red font-bold tracking-widest uppercase">Blood Center</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['home', 'awareness', 'stats', 'testimonials'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollTo(sec)}
                className={`text-sm font-semibold capitalize transition-colors ${
                  activeSection === sec
                    ? 'text-hospital-red'
                    : 'text-gray-500 dark:text-gray-400 hover:text-hospital-red'
                }`}
              >
                {sec}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-hospital-red transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-sm font-bold">
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-red-50/50 to-white dark:from-red-950/5 dark:to-hospital-gray-abyss">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-block bg-red-50 dark:bg-red-950/20 text-hospital-red text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Every Donor Is A Hero
            </span>
            <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-hospital-gray-deep dark:text-white leading-[1.1]">
              Donate Blood, <br />
              <span className="text-hospital-red">Share Life,</span> <br />
              Save Lives Today.
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              LifeFlow is a modern, real-time blood bank network connecting donors, administrators, and partner hospitals. A single donation takes just 15 minutes, but can save up to 3 patient lives.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?role=donor" className="btn-primary px-8 py-3.5 text-base">
                Become a Donor
              </Link>
              <Link to="/register?role=hospital" className="btn-secondary px-8 py-3.5 text-base">
                Request Blood Stock
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Visual Glassmorphic Widget Container */}
            <div className="relative w-full max-w-md bg-white/40 dark:bg-hospital-gray-deep/30 border border-white/20 dark:border-white/10 shadow-2xl p-6 rounded-3xl backdrop-blur-md">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-hospital-red/10 rounded-full blur-xl animate-pulse-slow" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-hospital-red/5 rounded-full blur-2xl" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-sm dark:text-white">Emergency Blood Stocks</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>

              {/* Sample Stock Cards */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white dark:bg-hospital-gray-deep/80 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/20 text-hospital-red flex items-center justify-center font-bold">O-</div>
                    <div>
                      <h4 className="text-xs font-bold dark:text-white">Universal O Negative</h4>
                      <p className="text-[10px] text-gray-400">Critical Stock Warning</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">4 Units</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white dark:bg-hospital-gray-deep/80 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-150 text-hospital-red bg-red-50 dark:bg-red-950/10 flex items-center justify-center font-bold">O+</div>
                    <div>
                      <h4 className="text-xs font-bold dark:text-white">O Positive</h4>
                      <p className="text-[10px] text-gray-400">Stable Stock</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">30 Units</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-white dark:bg-hospital-gray-deep/80 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-150 text-hospital-red bg-red-50 dark:bg-red-950/10 flex items-center justify-center font-bold">AB-</div>
                    <div>
                      <h4 className="text-xs font-bold dark:text-white">AB Negative</h4>
                      <p className="text-[10px] text-gray-400">Low Stock Alert</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">8 Units</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[11px] text-gray-400">Real-time stats synced across partner networks.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Awareness Section */}
      <section id="awareness" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs text-hospital-red font-bold uppercase tracking-wider">Educational Guides</span>
          <h3 className="text-3xl font-extrabold dark:text-white">Blood Donation Awareness</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">Understanding blood groups compatibility can prevent confusion and speed up emergency distributions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h4 className="text-xl font-bold dark:text-white">Who can donate?</h4>
            <div className="space-y-4">
              {[
                'Age between 18 and 65 years old.',
                'Minimum weight of 50 kg (110 lbs).',
                'Feeling healthy and fit on the day of donation.',
                'Gap of 90 days (3 months) since the last whole blood donation.',
                'No tattoos, piercings, or major dental surgeries in the past 6 months.',
              ].map((text, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{text}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/10">
              <h5 className="font-bold text-sm text-hospital-red mb-2">Did You Know?</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                About 1 in 7 patients entering a hospital will require a blood transfusion. Because blood components have a short shelf life (red cells last 42 days, platelets just 5 to 7 days), continuous donations are essential to keep banks fully stocked.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-hospital-gray-deep border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-base font-bold mb-4 dark:text-white">Blood Group Compatibility Chart</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-400">
                    <th className="py-2 font-semibold">Blood Group</th>
                    <th className="py-2 font-semibold">Can Donate To</th>
                    <th className="py-2 font-semibold">Can Receive From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {compatibilityData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-850/50">
                      <td className="py-2.5 font-bold text-hospital-red">{row.type}</td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-300 font-medium">{row.canGive}</td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-300 font-medium">{row.canReceive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-50 dark:bg-hospital-gray-deep/40 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h3 className="text-3xl font-extrabold dark:text-white">Seeded Network Operations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Continuous coordination ensures supply is met across regions.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-hospital-gray-deep p-6 rounded-3xl border border-gray-250/20 dark:border-gray-800 shadow-sm flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="text-3xl font-extrabold dark:text-white tracking-tight">{item.count}</h4>
                <p className="text-xs font-semibold text-gray-400 capitalize">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs text-hospital-red font-bold uppercase tracking-wider">Testimonials</span>
          <h3 className="text-3xl font-extrabold dark:text-white">What Our Community Says</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "The booking process was incredibly easy. I scheduled my appointment in 2 minutes, walked in, donated, and received a text notification when my blood unit was delivered to a hospital.",
              author: "Bruce Wayne",
              role: "Frequent O- Donor"
            },
            {
              quote: "As a hospital coordinator, having real-time stock dashboards has been a game-changer. We can place emergency requests and monitor approvals instantly, saving critical patient minutes.",
              author: "Dr. Pamela Isley",
              role: "City Central Hospital Admin"
            },
            {
              quote: "My daughter needed a platelet transfusion. The LifeFlow network matched us with a donor immediately. I'll forever be grateful to the anonymous donor and this management system.",
              author: "Martha Kent",
              role: "Patient Parent"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-hospital-gray-deep p-6 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium italic text-gray-500 dark:text-gray-300 leading-relaxed mb-6">
                "{item.quote}"
              </p>
              <div>
                <h5 className="font-bold text-sm dark:text-white">{item.author}</h5>
                <span className="text-[10px] text-hospital-red font-bold uppercase">{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-hospital-red text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Ready to Save Lives?</h3>
          <p className="text-red-100 text-sm max-w-lg mx-auto">
            Create an account in 60 seconds. Sign up to donate, request blood units, or coordinate inventory systems.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="bg-white hover:bg-red-50 text-hospital-red font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
              Get Started Free
            </Link>
            <button onClick={() => scrollTo('awareness')} className="bg-red-700/30 border border-white/20 hover:bg-red-700/50 font-bold px-8 py-3.5 rounded-xl transition-all">
              Learn Eligibility
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hospital-gray-deep dark:bg-hospital-gray-abyss border-t border-gray-800 dark:border-gray-900 text-gray-400 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-hospital-red flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h4 className="font-extrabold text-base text-white">LifeFlow</h4>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              Providing a seamless, digital repository connecting donors, hospitals, and coordinators globally.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-xs text-white uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => scrollTo('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => scrollTo('awareness')} className="hover:text-white">Eligibility Guidelines</button></li>
              <li><button onClick={() => scrollTo('stats')} className="hover:text-white">System Stats</button></li>
              <li><Link to="/login" className="hover:text-white">Sign In Account</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-xs text-white uppercase tracking-wider">Contact Info</h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-hospital-red" />
                <span>+1 (555) 0199</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-hospital-red" />
                <span>info@lifeflowcenter.org</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-hospital-red" />
                <span>100 Medical Plaza, District 5</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-xs text-white uppercase tracking-wider">Legal</h5>
            <p className="text-xs leading-relaxed">
              Medical protocols are governed under regional guidelines. Donor privacy is strictly encrypted.
            </p>
            <p className="text-[10px] text-gray-600">
              &copy; {new Date().getFullYear()} LifeFlow Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

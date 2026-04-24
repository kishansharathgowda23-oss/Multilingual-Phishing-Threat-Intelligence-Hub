import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Globe, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  MessageCircle,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Loader2,
  FileText,
  Settings,
  LogOut,
  Phone,
  KeyRound,
  User,
  Menu,
  X
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.986 0C5.367 0 0 5.366 0 11.985c0 2.63.852 5.068 2.316 7.072L.41 24l5.063-1.895A11.942 11.942 0 0011.986 24c6.619 0 11.985-5.367 11.985-11.985C23.971 5.366 18.605 0 11.986 0zm0 22.01c-2.107 0-4.084-.555-5.801-1.517l-.416-.232-3.456 1.293.923-3.326-.255-.407C1.945 15.938 1.3 14.025 1.3 11.985 1.3 6.084 6.084 1.3 11.986 1.3c5.9 0 10.685 4.784 10.685 10.685 0 5.902-4.785 10.685-10.685 10.685zM17.85 15.34c-.29-.145-1.72-.85-1.986-.948-.266-.096-.46-.145-.654.145-.193.29-.75 .948-.92 1.141-.168.193-.337.217-.627.072-.29-.145-1.226-.452-2.336-1.442-.864-.77-1.447-1.72-1.616-2.01-.168-.29-.018-.447.127-.591.13-.13.29-.338.435-.508.145-.169.193-.29.29-.483.097-.193.048-.362-.024-.507-.072-.145-.654-1.57-.895-2.15-.236-.568-.475-.49-.654-.499-.168-.009-.362-.009-.556-.009s-.508.072-.774.362c-.266.29-1.016.992-1.016 2.418 0 1.427 1.04 2.805 1.185 2.998.145.193 2.045 3.12 4.952 4.377.693.3 1.233.48 1.656.613.696.22 1.33.189 1.83.115.56-.083 1.72-.703 1.962-1.382.242-.68.242-1.261.169-1.382-.072-.121-.266-.193-.556-.338z"/>
  </svg>
);

const GmailIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const ChromeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm6.817-10.4H12.64c-.452-1.848-2.01-3.217-3.95-3.415L12 3.122c4.46.331 8.006 3.738 8.653 8.16l-1.836.718zm-8.817-2.4c-1.325 0-2.4 1.075-2.4 2.4s1.075 2.4 2.4 2.4 2.4-1.075 2.4-2.4-1.075-2.4-2.4-2.4zm-1.8 1.415C6.467 10.42 5.097 12.288 5.097 14.4c0 1.258.411 2.42 1.104 3.354L9.817 12h-1.617zm4.2 8.785c-1.892-.224-3.522-1.365-4.356-3.003L12 14.88c2.476.326 4.793-1.004 5.864-3.153l2.871 4.966A8.375 8.375 0 0 1 12.4 20.4z"/>
  </svg>
);
import { getAnalysisHistory } from './services/api';
import { auth } from './services/firebase';
import { 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPopup, 
  linkWithPhoneNumber,
  onAuthStateChanged 
} from 'firebase/auth';

/**
 * App Component
 * Enhanced security dashboard featuring a master toggle and individual 
 * "Solve" buttons for platform-specific threat resolution.
 */
const initialApps = [
  {
    id: '1',
    name: 'Banking Pro',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'FINANCE',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '2',
    name: 'SMS & Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'COMMUNICATION',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '3',
    name: 'Instagram',
    icon: <InstagramIcon className="w-5 h-5" />,
    category: 'SOCIAL MEDIA',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '4',
    name: 'Facebook',
    icon: <FacebookIcon className="w-5 h-5" />,
    category: 'SOCIAL MEDIA',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '5',
    name: 'WhatsApp',
    icon: <WhatsAppIcon className="w-5 h-5" />,
    category: 'SOCIAL',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '6',
    name: 'Gmail',
    icon: <GmailIcon className="w-5 h-5" />,
    category: 'COMMUNICATION',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '7',
    name: 'Chrome Browser',
    icon: <ChromeIcon className="w-5 h-5" />,
    category: 'UTILITY',
    stats: { spam: 0, malware: 0, resolved: 0 }
  },
  {
    id: '8',
    name: 'System Settings',
    icon: <Smartphone className="w-5 h-5" />,
    category: 'SYSTEM',
    stats: { spam: 0, malware: 0, resolved: 0 }
  }
];

const App = () => {
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  
  // Track manually resolved apps in the current session
  const [manuallyResolved, setManuallyResolved] = useState([]);
  const [apps, setApps] = useState(initialApps);
  const [loading, setLoading] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [spamDetails, setSpamDetails] = useState([]);

  // Auth States
  const [authStep, setAuthStep] = useState('loading'); // loading, google, phone, otp, authenticated
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(user => {
      if (user) {
        if (user.phoneNumber) {
          setAuthStep('authenticated');
        } else {
          setAuthStep('phone');
        }
      } else {
        setAuthStep('google');
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsAuthLoading(true);
      setAuthError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the transition
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      setIsAuthLoading(true);
      setAuthError('');
      
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await linkWithPhoneNumber(auth.currentUser, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setAuthStep('otp');
    } catch (error) {
      if (error.code === 'auth/credential-already-in-use' || error.code === 'auth/provider-already-linked') {
        setAuthStep('authenticated');
      } else {
        setAuthError(error.message);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    try {
      setIsAuthLoading(true);
      setAuthError('');
      await confirmationResult.confirm(otp);
      setAuthStep('authenticated');
    } catch (error) {
      setAuthError('Invalid OTP. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth?.signOut();
    setAuthStep('google');
    setIsProfileOpen(false);
  };

  useEffect(() => {
    if (authStep !== 'authenticated') return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getAnalysisHistory('anonymous', 50);
        
        // Filter out safe items and keep only threats for the details dashboard
        const threats = data.filter(item => item.status === 'Spam' || item.risk === 'High' || item.status === 'Suspicious');
        setSpamDetails(threats);
        
        setApps(currentApps => {
          const updatedApps = currentApps.map(app => ({
            ...app,
            stats: { spam: 0, malware: 0, resolved: 0 }
          }));

          data.forEach((item) => {
            const isFile = !!item.fileName || item.content?.startsWith('File:');
            const isEmail = item.emails && item.emails.length > 0;
            const isSpam = item.status === 'Spam';
            const isMalware = item.risk === 'High' || item.status === 'Suspicious';
            const isResolvedItem = item.status === 'Safe' || item.status === 'Clean' || item.risk === 'Low' && !isSpam && !isMalware;

            const contentLower = (item.content || item.fileName || '').toLowerCase();
             
            let targetAppId = '7'; // Default to Chrome Browser (Utility)
            
            if (isEmail || contentLower.includes('mail')) targetAppId = '6'; // Gmail
            else if (contentLower.includes('bank') || contentLower.includes('finance') || contentLower.includes('pay') || contentLower.includes('card')) targetAppId = '1'; // Banking Pro
            else if (contentLower.includes('sms') || contentLower.includes('message')) targetAppId = '2'; // SMS & Messages
            else if (contentLower.includes('insta') || contentLower.includes('ig')) targetAppId = '3'; // Instagram
            else if (contentLower.includes('face') || contentLower.includes('fb')) targetAppId = '4'; // Facebook
            else if (contentLower.includes('what') || contentLower.includes('wa')) targetAppId = '5'; // WhatsApp
            else if (isFile || contentLower.includes('system') || contentLower.includes('exe') || contentLower.includes('apk')) targetAppId = '8'; // System Settings

            const targetApp = updatedApps.find(a => a.id === targetAppId);
            if (targetApp) {
              if (isSpam) targetApp.stats.spam += 1;
              if (isMalware) targetApp.stats.malware += 1;
              if (isResolvedItem) targetApp.stats.resolved += 1;
            }
          });

          return updatedApps;
        });

      } catch (error) {
        console.error('Failed to load analysis history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authStep]);

  const handleToggle = () => {
    if (!isActive) {
      setIsActivating(true);
      setTimeout(() => {
        setIsActive(true);
        setIsActivating(false);
      }, 1500);
    } else {
      setIsActive(false);
      setManuallyResolved([]); // Reset manual fixes when master is toggled off
    }
  };

  const handleSolve = (id) => {
    setResolvingId(id);
    // Simulate a repair process
    setTimeout(() => {
      setResolvingId(null);
      setManuallyResolved(prev => [...prev, id]);
      
      // Update the local state to increment resolved count
      setApps(currentApps => currentApps.map(app => {
        if (app.id === id) {
          return {
            ...app,
            stats: { ...app.stats, resolved: app.stats.resolved + 1 }
          };
        }
        return app;
      }));
    }, 1200);
  };

  if (authStep === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center w-full">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Authenticating...</p>
      </div>
    );
  }

  if (authStep !== 'authenticated') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans w-full">
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-slate-700/50">
              <img src="/logo.jpg" alt="ShieldX Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">ShieldX Security</h2>
          <p className="text-slate-400 text-sm text-center mb-8">Mandatory two-step verification required to access the dashboard.</p>

          {authError && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {authError}
            </div>
          )}

          {authStep === 'google' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-sm font-semibold text-slate-300">Google Authentication</h3>
              </div>
              <button 
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="w-full py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Sign in with Google
              </button>
            </div>
          )}

          {authStep === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    <CheckCircle2 size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-400 line-through">Google Auth</h3>
                </div>
                <div className="h-[1px] w-8 bg-slate-800"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-sm font-semibold text-slate-300">Phone Auth</h3>
                </div>
              </div>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="+1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 outline-none transition-all placeholder:text-slate-700"
                      required
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                <button 
                  type="submit"
                  disabled={isAuthLoading || !phoneNumber}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  {isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : 'Send Verification Code'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 bg-transparent hover:bg-slate-800/50 text-slate-400 rounded-xl font-medium transition-all text-sm"
                >
                  Cancel & Go Back
                </button>
              </form>
            </div>
          )}

          {authStep === 'otp' && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-6 text-indigo-400 justify-center">
                  <KeyRound size={20} />
                  <h3 className="text-sm font-semibold">Enter Verification Code</h3>
               </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 text-center mb-4">Code sent to {phoneNumber}</p>
                  <input 
                    type="text" 
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-200 outline-none transition-all text-center tracking-[0.5em] font-mono text-lg"
                    maxLength={6}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isAuthLoading || otp.length < 6}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Code & Proceed'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 font-sans w-full relative overflow-x-hidden">
      
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        
        {/* Profile Button */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <User size={24} />
          </button>
          
          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-20">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/60">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg overflow-hidden border border-indigo-500/30">
                  {auth?.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    auth?.currentUser?.displayName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 truncate max-w-[150px]">{auth?.currentUser?.displayName || 'Unknown User'}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Security Administrator</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">Email</span>
                  <span className="text-slate-300 font-medium text-xs truncate max-w-[140px]" title={auth?.currentUser?.email}>{auth?.currentUser?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">Phone</span>
                  <span className="text-slate-300 font-medium text-xs">{auth?.currentUser?.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">Status</span>
                  <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">Clearance</span>
                  <span className="text-slate-300 font-medium text-xs font-mono">Level 5</span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full mt-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Menu Button */}
        <button 
          onClick={() => {
            setIsProfileOpen(false); // Close profile if open
            setIsDashboardOpen(true);
          }}
          className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Header Section */}
      <header className="w-full max-w-2xl mt-10 mb-8 text-center">
        <div 
          className={`mx-auto w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-700 mb-6 border ${
            isActive 
              ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
              : 'border-slate-800 grayscale opacity-70'
          }`}
        >
          <img src="/logo.jpg" alt="ShieldX Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
          {isActive ? 'System Shielded' : 'Action Required'}
        </h1>
        <p className="text-slate-400 text-sm px-4 leading-relaxed">
          {isActive 
            ? 'Total protection is active. Every sector is being scanned for vulnerabilities.' 
            : 'Vulnerabilities detected in several sectors. Activate master shield or solve individually.'}
        </p>
      </header>

      {/* Main Master Button */}
      <div className="w-full max-w-2xl mb-10">
        <button
          onClick={handleToggle}
          disabled={isActivating || loading}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 border shadow-2xl ${
            isActivating || loading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700' 
              : isActive 
                ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' 
                : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500 shadow-indigo-500/20'
          }`}
        >
          {isActivating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">Initializing Protocol...</span>
            </div>
          ) : isActive ? (
            <span>Disable Master Shield</span>
          ) : (
            <>
              <Lock size={20} />
              <span>Activate Master Shield</span>
            </>
          )}
        </button>
      </div>

      {/* List with Resolve Buttons */}
      <div className="w-full max-w-6xl flex-grow">
        <div className="flex justify-between items-center mb-5 px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Sector Vulnerability Report
          </h2>
          <div className="h-[1px] flex-grow ml-4 bg-slate-800/50"></div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm tracking-widest uppercase">Scanning Environment...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-3" />
            <p className="text-slate-400 text-sm">No recent threats detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {apps.map((app) => {
              const isResolved = isActive || manuallyResolved.includes(app.id);
              const isThisResolving = resolvingId === app.id;

              return (
                <div 
                  key={app.id} 
                  className={`group flex flex-col p-4 bg-slate-900/40 border rounded-2xl transition-all duration-500 ${
                    isResolved ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        isResolved ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {app.icon}
                      </div>
                      <div className="max-w-[200px] sm:max-w-[350px]">
                        <h3 className="font-semibold text-slate-200 text-sm truncate" title={app.name}>{app.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{app.category}</p>
                      </div>
                    </div>
                    
                    {/* Solve Button for individual sectors */}
                    {!isResolved ? (
                      <button 
                        onClick={() => handleSolve(app.id)}
                        disabled={isThisResolving}
                        className="px-4 py-2 flex-shrink-0 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                      >
                        {isThisResolving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Wrench size={12} />
                        )}
                        {isThisResolving ? 'Fixing' : 'Solve'}
                      </button>
                    ) : (
                      <div className="flex flex-shrink-0 items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Secured</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/50">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-slate-950/40">
                      <div className="flex items-center gap-1.5 text-orange-400/80 mb-1">
                        <AlertTriangle size={10} />
                        <span className="text-[9px] font-bold">SPAM</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">{app.stats.spam}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-slate-950/40">
                      <div className="flex items-center gap-1.5 text-red-400/80 mb-1">
                        <Bug size={10} />
                        <span className="text-[9px] font-bold">MALWARE</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">{app.stats.malware}</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-500 ${
                      isResolved ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-slate-950/40'
                    }`}>
                      <div className={`flex items-center gap-1.5 mb-1 ${isResolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 size={10} />
                        <span className="text-[9px] font-bold">FIXED</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${isResolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {app.stats.resolved}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="w-full max-w-6xl py-6 border-t border-slate-900 flex flex-col items-center gap-2 mt-auto">
        <p className="text-[9px] text-slate-700 uppercase tracking-widest text-center">
          Security Engine v4.2.0 • Real-time Threat Neutralization
        </p>
      </footer>

      {/* Sliding Spam Details Dashboard */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-950 border-l border-slate-800 transform transition-transform duration-500 ease-in-out z-50 flex flex-col ${
          isDashboardOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 w-5 h-5" />
            Threat Details
          </h2>
          <button 
            onClick={() => setIsDashboardOpen(false)}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {spamDetails.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No spam or malware details found.
            </div>
          ) : (
            spamDetails.map((threat, idx) => (
              <div key={threat.id || idx} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm font-semibold text-slate-300 break-all">
                    {threat.fileName || threat.content || 'Unknown Source'}
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider whitespace-nowrap ${
                    threat.risk === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {threat.risk === 'High' ? 'Malware' : 'Spam'}
                  </span>
                </div>
                {threat.emails && threat.emails.length > 0 && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail size={12} /> {threat.emails[0]}
                  </div>
                )}
                <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">
                  Status: {threat.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Overlay to close dashboard when clicking outside */}
      {isDashboardOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsDashboardOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

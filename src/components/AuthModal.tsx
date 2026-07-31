import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Building2, ShieldCheck, Sparkles, LogIn, UserPlus, CheckCircle2, Hexagon, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { User, SRHU_DEPARTMENTS, SRHUDepartment } from '../types';
import { loginUser, signupUser } from '../lib/api';

interface AuthModalProps {
  initialMode?: 'signin' | 'signup';
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'signin',
  onSuccess,
  onClose,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<string>(SRHU_DEPARTMENTS[3]); // School of Science & Technology
  const [role, setRole] = useState<'student' | 'faculty' | 'organizer'>('student');
  const [studentId, setStudentId] = useState('');

  // Handle Quick Demo Account Logins
  const handleQuickLogin = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, 'password123');
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Failed to sign in with demo account');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials. Try using demo login buttons below.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signupEmail || !signupPassword || !department) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await signupUser({
        fullName,
        email: signupEmail,
        password: signupPassword,
        phone,
        department,
        role,
        studentId,
      });

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-fade-in relative">
        {/* Header Branding */}
        <div className="p-6 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 mb-3 text-indigo-400 shadow-lg shadow-indigo-600/20">
            <Hexagon className="w-7 h-7 text-amber-300 fill-amber-300/20" />
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Welcome to EVENT<span className="text-indigo-400">HIVE</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Swami Rama Himalayan University • Dehradun Portal
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mt-5 font-mono text-xs">
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono font-semibold">
              {error}
            </div>
          )}

          {mode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">SRHU Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@srhu.edu.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to EventHive</span>
                  </>
                )}
              </button>

              {/* Demo Account Quick Logins */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold text-center">
                  Quick 1-Click SRHU Authentication Demos
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ananya.sharma@srhu.edu.in')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200">Ananya Sharma</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                        Student
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">School of Science & Tech</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rohan.mehta@srhu.edu.in')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200">Rohan Mehta</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                        Student
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">Himalayan Institute of Med</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('events@srhu.edu.in')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Dr. Rajesh Verma</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                        Faculty
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">SST Event Lead & Host</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('hims.faculty@srhu.edu.in')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Dr. Sunita Kothari</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                        Faculty
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">HIMS Medical Faculty</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs font-mono">
              {/* Explicit Role Picker */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">Select Account Purpose *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'student'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300 mb-0.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>SRHU Student</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Register & book passes for campus events across departments.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === 'faculty' || role === 'organizer'
                        ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 mb-0.5">
                      <Building2 className="w-4 h-4" />
                      <span>Faculty / Host</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Host, publish, and manage official SRHU department events.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Rohan Singh' : 'e.g. Dr. Ramesh Chander'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Official SRHU Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder={role === 'student' ? 'student@srhu.edu.in' : 'faculty@srhu.edu.in'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">SRHU School / Department *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-indigo-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {SRHU_DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-slate-900">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">
                  {role === 'student' ? 'Student / Roll ID' : 'Faculty ID'}
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. SRHU/2026/SST/102' : 'e.g. FAC/SRHU/882'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 pt-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create SRHU EventHive Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

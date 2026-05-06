import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, UserPlus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-signup', { email: form.email, otp });
      login(data.token, data.user);
      toast.success('Account created successfully! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('New OTP sent!');
      setOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Inventory Pro</h1>
          <p className="text-blue-200 mt-1">Stock Management System</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-white text-brand-700' : 'bg-white/20 text-white/50'}`}>{s}</div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
              <p className="text-slate-500 text-sm mb-6">Fill in your details to get started</p>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input-field" placeholder="Your name" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Business Name</label>
                    <input className="input-field" placeholder="Optional" value={form.businessName}
                      onChange={e => setForm({ ...form, businessName: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>

                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                      placeholder="Min. 6 characters" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus size={18} /> Send OTP</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Verify your email</h2>
                <p className="text-slate-500 text-sm mt-1">
                  We sent a 6-digit OTP to <strong>{form.email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="label">Enter OTP</label>
                  <input
                    type="text"
                    className="input-field text-center text-2xl font-bold tracking-[0.5em] py-4"
                    placeholder="● ● ● ● ● ●"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1.5 text-center">OTP is valid for 10 minutes</p>
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Verify & Create Account</>}
                </button>

                <div className="text-center">
                  <button type="button" onClick={handleResend} disabled={loading}
                    className="text-sm text-brand-600 hover:underline font-medium disabled:opacity-50">
                    Resend OTP
                  </button>
                  <span className="text-slate-400 mx-2">·</span>
                  <button type="button" onClick={() => setStep(1)}
                    className="text-sm text-slate-500 hover:underline">
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

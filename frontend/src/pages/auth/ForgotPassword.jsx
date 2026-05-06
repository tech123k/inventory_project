import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
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
      const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
      setResetToken(data.resetToken);
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      toast.success('Password reset successfully!');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Inventory Pro</h1>
          <p className="text-blue-200 mt-1">Reset your password</p>
        </div>

        {step < 4 && (
          <div className="flex items-center gap-2 mb-6 justify-center">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-white text-brand-700' : 'bg-white/20 text-white/50'}`}>
                  {step > i + 1 ? <CheckCircle size={12} /> : null}
                  {s}
                </div>
                {i < steps.length - 1 && <div className={`w-6 h-0.5 ${step > i + 1 ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Forgot password?</h2>
                  <p className="text-slate-500 text-sm">Enter your email to receive an OTP</p>
                </div>
              </div>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input-field" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail size={18} /> Send Reset OTP</>}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Enter OTP</h2>
                <p className="text-slate-500 text-sm">Sent to <strong>{email}</strong></p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="label">6-Digit OTP</label>
                  <input type="text" className="input-field text-center text-2xl font-bold tracking-[0.5em] py-4"
                    placeholder="● ● ● ● ● ●" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Verify OTP</>}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-slate-500 hover:underline">
                  ← Back
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Set new password</h2>
                  <p className="text-slate-500 text-sm">Choose a strong password</p>
                </div>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                      placeholder="Min. 6 characters" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock size={18} /> Reset Password</>}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Reset!</h2>
              <p className="text-slate-500 text-sm mb-6">Your password has been reset successfully.</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Go to Login
              </button>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

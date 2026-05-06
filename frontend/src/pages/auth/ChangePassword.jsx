import { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('New passwords do not match');
    if (form.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast.success('Password changed successfully!');
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (field) => setShow(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
          <p className="text-slate-500 text-sm mt-1">Update your account password</p>
        </div>

        <div className="card">
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm font-medium">Password changed successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'current', label: 'Current Password', field: 'currentPassword', placeholder: 'Enter current password' },
              { key: 'new', label: 'New Password', field: 'newPassword', placeholder: 'Min. 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword', placeholder: 'Re-enter new password' }
            ].map(({ key, label, field, placeholder }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    type={show[key] ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => toggle(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Lock size={18} /> Update Password</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-2">Password Requirements:</p>
            <ul className="text-xs text-blue-500 space-y-1">
              <li>• Minimum 6 characters</li>
              <li>• New password must be different from current</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

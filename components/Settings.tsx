import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, User, Save, CheckCircle, AlertCircle, Eye, EyeOff, Database, RefreshCw, LogOut, Building, Users, Home, CreditCard } from 'lucide-react';

const Settings: React.FC = () => {
  const { logout, resetToDemoData, properties, units, tenants, payments, expenses, maintenanceTickets } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setStatus('error');
      setMessage('Password must be at least 4 characters long.');
      return;
    }

    try {
      const token = localStorage.getItem('propMinds_token');
      const res = await fetch('/api/auth/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newUsername, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to update credentials.');
        return;
      }

      setStatus('success');
      setMessage('Credentials updated successfully! You will need to use these on your next login.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage('Network error while updating credentials.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings & Administration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage system credentials, security, and view platform operational health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Credential Update */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Credentials</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update administrative login credentials</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl flex items-center gap-2">
                <CheckCircle size={18} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white text-gray-900 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New administrator username"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white text-gray-900 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white text-gray-900 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white text-gray-900 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save size={16} />
              Update Credentials
            </button>
          </form>
        </div>

        {/* System & Data Overview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current record counts and state</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                <Building className="text-blue-500" size={20} />
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{properties.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Properties</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                <Home className="text-emerald-500" size={20} />
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{units.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Units Total</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                <Users className="text-amber-500" size={20} />
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{tenants.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tenants</div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                <CreditCard className="text-indigo-500" size={20} />
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{payments.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Payments</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={resetToDemoData}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh Data Sync
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Sign Out of PropMinds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

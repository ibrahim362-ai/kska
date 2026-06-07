import { useState, useEffect } from 'react';
import { Settings, Save, Mail, Lock, Key, User, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'platform'>('account');

  const [settings, setSettings] = useState({
    appName: 'KSKA',
    registrationOpen: 'true',
    maintenanceMode: 'false',
    maxPostsPerDay: '50',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    api.get('/settings').then((res) => {
      const data = res.data.data;
      setSettings({
        appName: data.appName || 'KSKA',
        registrationOpen: data.registrationOpen || 'true',
        maintenanceMode: data.maintenanceMode || 'false',
        maxPostsPerDay: data.maxPostsPerDay || '50',
      });
    }).catch(() => {});
  }, []);

  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailOk, setEmailOk] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passOk, setPassOk] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailMsg('Email is required');
      setEmailOk(false);
      return;
    }
    setEmailLoading(true);
    setEmailMsg('');
    try {
      await api.put('/users/profile', { email });
      setUser({ ...user!, email });
      setEmailMsg('Email updated successfully');
      setEmailOk(true);
      setEmail('');
    } catch (err: any) {
      setEmailMsg(err.response?.data?.message || 'Failed to update email');
      setEmailOk(false);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassMsg('All fields are required');
      setPassOk(false);
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg('New password must be at least 6 characters');
      setPassOk(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg('Passwords do not match');
      setPassOk(false);
      return;
    }
    setPassLoading(true);
    setPassMsg('');
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg('Password changed successfully');
      setPassOk(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg(err.response?.data?.message || 'Failed to change password');
      setPassOk(false);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings size={24} className="text-white" />
          </div>
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and platform settings</p>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 w-fit border-2 border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'account' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <User size={16} className="inline mr-2" />
          Account
        </button>
        <button
          onClick={() => setActiveTab('platform')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'platform' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Settings size={16} className="inline mr-2" />
          Platform
        </button>
      </div>

      {activeTab === 'account' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Email</h2>
                <p className="text-sm text-gray-500">Update your email address</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Current Email</p>
              <p className="font-mono text-sm font-medium text-gray-700">{user?.email}</p>
            </div>
            <form onSubmit={handleChangeEmail} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailMsg(''); }}
                  placeholder="new@email.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {emailMsg && (
                <div className={`text-sm flex items-center gap-2 p-3 rounded-xl ${emailOk ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {emailOk ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {emailMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold disabled:opacity-50 shadow-lg transition-all"
              >
                {emailLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPassMsg(''); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPassMsg(''); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPassMsg(''); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Re-enter new password"
                />
              </div>
              {passMsg && (
                <div className={`text-sm flex items-center gap-2 p-3 rounded-xl ${passOk ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {passOk ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {passMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={passLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold disabled:opacity-50 shadow-lg transition-all"
              >
                {passLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Platform Configuration</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Application Name</label>
              <input
                type="text" value={settings.appName}
                onChange={e => setSettings({...settings, appName: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Posts Per Day</label>
              <input
                type="number" value={settings.maxPostsPerDay}
                onChange={e => setSettings({...settings, maxPostsPerDay: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all max-w-xs"
              />
            </div>
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">User Registration</p>
                <p className="text-sm text-gray-500 mt-1">Allow new users to register</p>
              </div>
              <button
                onClick={() => setSettings({...settings, registrationOpen: settings.registrationOpen === 'true' ? 'false' : 'true'})}
                className={`relative w-16 h-8 rounded-full transition-colors ${settings.registrationOpen === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${settings.registrationOpen === 'true' ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-5 bg-red-50 rounded-xl border border-red-200">
              <div>
                <p className="font-semibold text-red-900">Maintenance Mode</p>
                <p className="text-sm text-red-600 mt-1">Temporarily disable public access</p>
              </div>
              <button
                onClick={() => setSettings({...settings, maintenanceMode: settings.maintenanceMode === 'true' ? 'false' : 'true'})}
                className={`relative w-16 h-8 rounded-full transition-colors ${settings.maintenanceMode === 'true' ? 'bg-red-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${settings.maintenanceMode === 'true' ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>
            <button 
              onClick={async () => {
                setSettingsLoading(true);
                setSettingsMsg('');
                try {
                  await api.put('/settings', settings);
                  setSettingsMsg('Settings saved successfully');
                } catch {
                  setSettingsMsg('Failed to save settings');
                } finally {
                  setSettingsLoading(false);
                }
              }}
              disabled={settingsLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 text-sm font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={18} /> {settingsLoading ? 'Saving...' : 'Save Platform Settings'}
            </button>
            {settingsMsg && (
              <p className={`text-sm ${settingsMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{settingsMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { User, KeyRound, ShieldCheck, Check, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Update profile error', err);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-xs">
        <h1 className="text-card-title md:text-section-title font-jakarta font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" /> User Profile & Security Credentials
        </h1>
        <p className="text-body text-slate-600">
          Manage your account profile, avatar URL, and authentication credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center space-y-4 shadow-xs">
          <img
            src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'FlowDesk')}`}
            alt={user?.name}
            className="w-24 h-24 rounded-full border-2 border-indigo-200 object-cover mx-auto shadow-xs"
          />

          <div>
            <h3 className="text-card-title font-jakarta font-semibold text-slate-900">{user?.name}</h3>
            <p className="text-data text-slate-500">{user?.email}</p>
            <p className="text-label font-semibold text-indigo-600 mt-1">{formData.jobTitle || 'Software Engineer'}</p>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-left">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-label">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Assigned Spring Security Roles
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles?.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 rounded font-mono text-data font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="text-card-title font-jakarta font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Profile Details
            </h3>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-label flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> Profile updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-label font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-label font-medium text-slate-700">Job Title / Role</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Lead Java Architect"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-label font-medium text-slate-700">Avatar Image URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-label font-medium text-slate-700">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a brief professional bio..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>

          {/* Change Password Section */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-card-title font-jakarta font-semibold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" /> Change Security Password
            </h3>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-label flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> Password updated successfully!
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-label">
                {passwordError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-label font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-label font-semibold cursor-pointer shadow-xs font-sans"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Settings and Profile Component - Matches Haidee's profile page
 */

import React, { useState, useEffect } from 'react';
import { profileAPI, getAuth } from '../services/apiService';
import './SettingsProfile.css';

export const SettingsProfile = ({ onNavigate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileAPI.getMe();
      setProfile(res.data);
      setEditData({
        phone_number: res.data.phone_number || '',
      });
    } catch (err) {
      // If profile doesn't exist, show basic user info from auth
      const { user } = getAuth();
      if (user) {
        setProfile({
          user: user,
          phone_number: '',
          photo: null,
        });
        setEditData({ phone_number: '' });
      }
      setError(err.response?.data?.error || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      await profileAPI.updateProfile(editData);
      setSaveMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setSaveMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      await profileAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="page-loading">Loading profile...</div>;

  const user = profile?.user || getAuth()?.user || {};
  const isOwner = true; // Default assumption for logged-in user

  return (
    <div className="settings-profile">
      <div className="profile-card">
        <h1 className="profile-title">
          {isOwner ? 'OWNER 👑' : 'EMPLOYEE'}
        </h1>

        <div className="profile-photo-container">
          {profile?.photo ? (
            <img src={profile.photo} alt="Profile" className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder">
              {(user.first_name || user.username || '?')[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label>Email</label>
            <p>{user.email || '—'}</p>
          </div>
          <div className="profile-field">
            <label>First Name</label>
            {editing ? (
              <p>{user.first_name || '—'}</p>
            ) : (
              <p>{user.first_name || '—'}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Last Name</label>
            <p>{user.last_name || '—'}</p>
          </div>
          <div className="profile-field">
            <label>Phone Number</label>
            {editing ? (
              <input
                type="text"
                value={editData.phone_number}
                onChange={e => setEditData({ ...editData, phone_number: e.target.value })}
                className="profile-input"
              />
            ) : (
              <p>{profile?.phone_number || '—'}</p>
            )}
          </div>
        </div>

        {saveMessage && (
          <div className={`profile-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}

        {editing ? (
          <div className="profile-actions">
            <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn-edit" onClick={() => setEditing(true)}>Edit Profile</button>
        )}

        {/* Change Password Section */}
        <div className="password-section">
          <h2>Change Password</h2>

          {passwordError && <div className="profile-message error">{passwordError}</div>}
          {passwordSuccess && <div className="profile-message success">{passwordSuccess}</div>}

          <form onSubmit={handleChangePassword} className="password-form">
            <div className="password-field">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
              />
            </div>
            <div className="password-field">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
              />
              <span className="field-hint">At least 8 characters, mix letters and numbers.</span>
            </div>
            <div className="password-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
              />
              <span className="field-hint">Enter the same password again for confirmation.</span>
            </div>
            <button type="submit" className="btn-change-password" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }}>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default SettingsProfile;

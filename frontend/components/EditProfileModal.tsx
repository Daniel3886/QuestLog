'use client';

import React, { useState } from 'react';
import {usersApi} from '@/lib/api';
import type {UserProfile} from '@/lib/types';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
};

const avatarOptions = ['🧙', '🗡️', '✨', '💚', '⚡', '🛡️', '🌿', '🏹', '🔮', '🐺', '🐉', '🔥', '💧', '🌟'];

export default function EditProfileModal({ open, onClose, profile, onUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🧙');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);

  try {
    const updated = await usersApi.updateProfile({
      username: username !== profile.username ? username : undefined,
      bio: bio !== profile.bio ? bio : undefined,
      avatar: avatar !== profile.avatar ? avatar : undefined,
    });
    onUpdate(updated);
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: updated }));
    onClose();
  } catch (err: any) {
    setError(err.message || 'Failed to update profile');
  } finally {
    setSubmitting(false);
  }
};

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Edit Profile</h3>
          <button className="modal__close" onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="pixel-error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="modal__field">
              <label>Username (unique)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                required
              />
            </div>

            <div className="modal__field">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="pixel-input pixel-input--textarea"
                rows={3}
                placeholder="Tell others about yourself..."
              />
            </div>

            <div className="modal__field">
              <label>Avatar Emoji</label>
              <div className="avatar-selector">
                {avatarOptions.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-option ${avatar === emoji ? 'active' : ''}`}
                    onClick={() => setAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button type="submit" className="pixel-btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="pixel-btn pixel-btn--secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
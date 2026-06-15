'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import './register.scss';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const tokens = await authApi.register({
        email,
        password,
        confirmPassword,
        username: username.trim() || undefined,
      });
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push('/lobby');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__particles"></div>
      <div className="register__container pixel-card">
        <div className="register__header">
          <div className="register__icon">📝</div>
          <h1 className="pixel-title">CREATE ACCOUNT</h1>
          <p className="register__subtitle">Begin your legendary journey</p>
        </div>
        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label>🏷️ Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pixel-input"
              placeholder="Optional"
            />
          </div>
          <div className="register__field">
            <label>📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pixel-input"
              required
            />
          </div>
          <div className="register__field">
            <label>🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pixel-input"
              required
            />
          </div>
          <div className="register__field">
            <label>🔒 Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pixel-input"
              required
            />
          </div>
          <div className="policy-note">
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              <span className="policy-link">Terms of Service</span>
            </a>
            .
          </div>
          {error && <div className="register__error">{error}</div>}
          <button
            type="submit"
            className="pixel-btn pixel-btn--large"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING...' : '⚔️ REGISTER'}
          </button>
        </form>
        <div className="register__footer">
          <span>Already have an account?</span>
          <Link href="/login" className="register__login-link">
            Login →
          </Link>
        </div>
      </div>
    </div>
  );
}

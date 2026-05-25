'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import './login.scss';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tokens = await authApi.login(email, password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push('/lobby');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Login failed. Try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__particles"></div>

      <div className="login__container pixel-card">
        <div className="login__header">
          <div className="login__icon">🔑</div>
          <h1 className="pixel-title">LOGIN</h1>
          <p className="login__subtitle">
            Enter your credentials to continue your adventure
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label htmlFor="email">📧 Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="pixel-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">🔒 Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pixel-input"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login__error">{error}</div>}

          <button
            type="submit"
            className="pixel-btn pixel-btn--large"
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING IN...' : '▶ LOGIN'}
          </button>
        </form>

        <div className="login__footer">
          <span>New adventurer?</span>
          <Link href="/register" className="login__register-link">
            Create an account →
          </Link>
        </div>
      </div>
    </div>
  );
}

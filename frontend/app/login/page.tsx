// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import './login.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // TODO: Replace with real authentication logic
    // For now, just simulate a delay and fake validation
    setTimeout(() => {
      if (email === 'demo@questlog.com' && password === 'password') {
        // Simulate successful login – redirect or store token
        window.location.href = '/lobby';
      } else {
        setError('Invalid email or password. Try demo@questlog.com / password');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="login">
      <div className="login__particles"></div>

      <div className="login__container pixel-card">
        <div className="login__header">
          <div className="login__icon">🔑</div>
          <h1 className="pixel-title">LOGIN</h1>
          <p className="login__subtitle">Enter your credentials to continue your adventure</p>
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

          <button type="submit" className="pixel-btn pixel-btn--large" disabled={isLoading}>
            {isLoading ? 'LOGGING IN...' : '▶ LOGIN'}
          </button>
        </form>

        <div className="login__footer">
          <span>New adventurer?</span>
          <Link href="/register" className="login__register-link">
            Create an account →
          </Link>
        </div>

        <div className="login__demo">
          <p>💡 Demo credentials:</p>
          <code>demo@questlog.com / password</code>
        </div>
      </div>
    </div>
  );
}
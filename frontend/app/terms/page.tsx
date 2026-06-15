// app/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import './terms.scss';

export const metadata = {
  title: 'Terms of Service - QuestLog',
  description: 'Terms and conditions for using QuestLog',
};

export default function TermsPage() {
  return (
    <div className="terms">
      <div className="terms__particles"></div>

      <div className="terms__container pixel-card">
        <div className="terms__header">
          <div className="terms__icon">📜</div>
          <h1 className="pixel-title">TERMS OF SERVICE</h1>
          <p className="terms__subtitle">Last updated: June 15, 2026</p>
        </div>

        <div className="terms__content">
          <section className="terms__section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using QuestLog ("the App"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the App.
            </p>
          </section>

          <section className="terms__section">
            <h2>2. Description of Service</h2>
            <p>
              QuestLog is a gamified habit‑tracking platform that allows users to create personal quests,
              join guilds, participate in public events, and earn rewards. The App is provided "as is"
              and may be updated or modified at any time.
            </p>
          </section>

          <section className="terms__section">
            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to accept responsibility for all activities that occur under your account.
              QuestLog reserves the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="terms__section">
            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Post offensive, abusive, or illegal content</li>
              <li>Harass, threaten, or impersonate other users</li>
              <li>Exploit bugs or cheat the system</li>
              <li>Use the App for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="terms__section">
            <h2>5. Reporting & Moderation</h2>
            <p>
              Users may report inappropriate content or behavior using the report function.
              Administrators reserve the right to remove content, issue warnings, or ban users
              who violate these terms. Banned users will have limited access (only lobby features).
            </p>
          </section>

          <section className="terms__section">
            <h2>6. Virtual Currency & Items</h2>
            <p>
              Coins and Gems are virtual currencies with no real‑world value. They cannot be
              exchanged for real money, goods, or services. QuestLog reserves the right to modify
              or remove virtual currency and items at any time.
            </p>
          </section>

          <section className="terms__section">
            <h2>7. Intellectual Property</h2>
            <p>
              All content, logos, and designs are the property of QuestLog. You may not copy,
              modify, or distribute any part of the App without permission.
            </p>
          </section>

          <section className="terms__section">
            <h2>8. Limitation of Liability</h2>
            <p>
              QuestLog is not liable for any indirect, incidental, or consequential damages
              arising from your use of the App. We do not guarantee that the App will be
              uninterrupted or error‑free.
            </p>
          </section>

          <section className="terms__section">
            <h2>9. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the App after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="terms__section">
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br />
              <strong>Email:</strong> support@questlog.com
              <br />
              <strong>Discord:</strong> discord.gg/questlog
            </p>
          </section>
        </div>

        <div className="terms__footer">
          <Link href="/" className="pixel-btn">
            ← Back to Home
          </Link>
          <Link href="/register" className="pixel-btn pixel-btn--primary">
            Start Your Quest
          </Link>
        </div>
      </div>
    </div>
  );
}
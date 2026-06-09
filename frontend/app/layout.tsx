import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import BugReportButton from '@/components/BugReportButton';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QuestLog – Pixel Habit RPG',
  description:
    'Turn your daily habits into an 8‑bit adventure. Solo quests, guild battles, and global events.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="scanline"></div>
        <div className="parallax-bg"></div>
        <SiteHeader />
        <main className="pixel-main">{children}</main>
        <footer className="pixel-footer">
          <div className="pixel-footer__inner">
            <p>© 2025 QUESTLOG – FORGE YOUR LEGEND</p>
            <div className="pixel-footer__links">
              <Link href="/about">About</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <BugReportButton />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

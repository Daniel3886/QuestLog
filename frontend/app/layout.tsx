import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Image from "next/image";
import User_Icon from "../media/user/user-icon.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const getUserData = async () => {
  // Simulate an API call to fetch user data
  if (false) {
    return {
      name: "John Doe",
    };
  }
  return null;
};

export const metadata: Metadata = {
  title: "LOH",
  description: "PIDR",
};

export default async function RootLayout
({  children,}: Readonly<{  children: React.ReactNode;}>) 
{
  const user = await getUserData();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Top sticky header */}
        <header className="topbar" role="banner">
          <div className="topbar-inner">
            <div className="logo">QuestLog</div>

            <nav className="nav-links" aria-label="Top navigation">
              <a href="/">Home</a>
              <a href="/lobby">Lobby</a>
              <a href="/tavern">Tavern</a>
              <a href="/about">About</a>
            </nav>

            <div className="actions">
              {user ? (
                <button className="profile-link" aria-label="User menu">
                  <Image src={User_Icon} alt="User Avatar" width={48} height={48} />
                </button>
              ) : (
                <button className="login-link">Login</button>
              )}
            </div>
          </div>
        </header>

        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}

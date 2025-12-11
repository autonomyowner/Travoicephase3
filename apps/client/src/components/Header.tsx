'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/nextjs';
import { useLanguage } from './LanguageProvider';
import { Language } from '@/lib/translations';

export default function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageToggle = () => {
    const newLang: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header
      className="w-full border-b"
      style={{
        background: 'rgba(254, 253, 251, 0.95)',
        backdropFilter: 'blur(8px)',
        borderColor: 'var(--border-soft)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold select-none"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--matcha-600)',
            }}
          >
            TRAVoices
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.header.home}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.header.pricing}
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.dashboard}
              </Link>
            </SignedIn>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--bg-elevated)]"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-soft)',
              }}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            <SignedIn>
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.hello}, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="matcha-btn matcha-btn-secondary text-sm px-4 py-2"
              >
                {t.header.logout}
              </button>
            </SignedIn>
            <SignedOut>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.login}
              </Link>
              <Link href="/signup" className="matcha-btn matcha-btn-primary text-sm px-5 py-2">
                {t.header.getStarted}
              </Link>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)]"
            aria-label="Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-[var(--text-primary)] transition-transform ${
                  mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-[var(--text-primary)] ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-[var(--text-primary)] transition-transform ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-soft)]">
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm font-medium py-2"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.header.home}
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium py-2"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.header.pricing}
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium py-2"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.header.dashboard}
                </Link>
              </SignedIn>

              {/* Mobile Language Switcher */}
              <button
                onClick={handleLanguageToggle}
                className="text-sm font-medium py-2 w-full text-start"
                style={{ color: 'var(--text-secondary)' }}
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>

              <div className="pt-3 border-t border-[var(--border-soft)]">
                <SignedIn>
                  <div className="flex flex-col gap-3">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.header.hello}, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]}
                    </span>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="matcha-btn matcha-btn-secondary text-sm w-full"
                    >
                      {t.header.logout}
                    </button>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="matcha-btn matcha-btn-secondary text-sm w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.header.login}
                    </Link>
                    <Link
                      href="/signup"
                      className="matcha-btn matcha-btn-primary text-sm w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.header.getStarted}
                    </Link>
                  </div>
                </SignedOut>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

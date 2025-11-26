'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
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
            Matcha
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Accueil
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tarifs
            </Link>
            {isAuthenticated && (
              <Link
                href="/tableau-de-bord"
                className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tableau de bord
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Bonjour, {user?.prenom}
                </span>
                {user?.plan === 'pro' && (
                  <span className="matcha-badge matcha-badge-pro">Pro</span>
                )}
                <button
                  onClick={handleLogout}
                  className="matcha-btn matcha-btn-secondary text-sm px-4 py-2"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-[var(--matcha-600)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Connexion
                </Link>
                <Link href="/signup" className="matcha-btn matcha-btn-primary text-sm px-5 py-2">
                  Commencer
                </Link>
              </>
            )}
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
                Accueil
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium py-2"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              {isAuthenticated && (
                <Link
                  href="/tableau-de-bord"
                  className="text-sm font-medium py-2"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
              )}
              <div className="pt-3 border-t border-[var(--border-soft)]">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Bonjour, {user?.prenom}
                      {user?.plan === 'pro' && (
                        <span className="ml-2 matcha-badge matcha-badge-pro">
                          Pro
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="matcha-btn matcha-btn-secondary text-sm w-full"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="matcha-btn matcha-btn-secondary text-sm w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      className="matcha-btn matcha-btn-primary text-sm w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Commencer
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

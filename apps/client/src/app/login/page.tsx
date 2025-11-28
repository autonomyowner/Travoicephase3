'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../components/AuthProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--cream-50)' }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{t.login.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-15"
          style={{
            background:
              'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block text-2xl font-semibold mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--matcha-600)',
              }}
            >
              TRAVoices
            </Link>
            <h1
              className="text-3xl mb-2"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.login.welcomeBack}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t.login.loginSubtitle}
            </p>
          </div>

          {/* Login Form */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t.login.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login.emailPlaceholder}
                required
                autoComplete="email"
              />

              <Input
                label={t.login.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder}
                required
                autoComplete="current-password"
              />

              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                {t.login.signIn}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t.login.noAccount}{' '}
                <Link
                  href="/signup"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--matcha-600)' }}
                >
                  {t.login.createAccount}
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div
            className="mt-6 p-4 rounded-2xl text-center"
            style={{
              background: 'var(--matcha-100)',
              border: '1px solid var(--matcha-200)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--matcha-700)' }}>
              <strong>{t.login.demoMode}</strong> {t.login.demoHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

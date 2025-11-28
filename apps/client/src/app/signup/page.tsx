'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../components/AuthProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { t } = useLanguage();
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'gratuit' | 'pro'>('gratuit');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan === 'pro') {
      setSelectedPlan('pro');
    }
  }, [searchParams]);

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
      await signup(email, password, prenom);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.signup.error);
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
        <p style={{ color: 'var(--text-secondary)' }}>{t.signup.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[400px] h-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px] opacity-15"
          style={{
            background:
              'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, 30%)',
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
              {t.signup.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t.signup.subtitle}
            </p>
          </div>

          {/* Plan Selection */}
          <div
            className="rounded-2xl p-4 mb-6"
            style={{
              background: 'var(--cream-100)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <p
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.signup.choosePlan}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan('gratuit')}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedPlan === 'gratuit' ? 'ring-2 ring-[#68a67d]' : ''
                }`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <span
                  className="block font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.signup.free}
                </span>
                <span
                  className="block text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.signup.freeDesc}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`p-4 rounded-xl text-left transition-all relative ${
                  selectedPlan === 'pro' ? 'ring-2 ring-[#68a67d]' : ''
                }`}
                style={{
                  background:
                    selectedPlan === 'pro'
                      ? 'linear-gradient(135deg, var(--matcha-50) 0%, var(--matcha-100) 100%)'
                      : 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <span
                  className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--terra-400)',
                    color: 'white',
                  }}
                >
                  {t.signup.freeTrial}
                </span>
                <span
                  className="block font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.signup.proPrice}
                </span>
                <span
                  className="block text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.signup.proDesc}
                </span>
              </button>
            </div>
          </div>

          {/* Signup Form */}
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
                label={t.signup.firstName}
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder={t.signup.firstNamePlaceholder}
                required
                autoComplete="given-name"
              />

              <Input
                label={t.signup.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.signup.emailPlaceholder}
                required
                autoComplete="email"
              />

              <Input
                label={t.signup.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.signup.passwordPlaceholder}
                required
                autoComplete="new-password"
                hint={t.signup.passwordHint}
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

              <Button type="submit" fullWidth isLoading={isLoading} size="lg">
                {t.signup.createAccount}
              </Button>
            </form>

            <div
              className="mt-6 pt-6 border-t"
              style={{ borderColor: 'var(--border-soft)' }}
            >
              <p
                className="text-center text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.signup.alreadyRegistered}{' '}
                <Link
                  href="/login"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--matcha-600)' }}
                >
                  {t.signup.signIn}
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p
            className="mt-6 text-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.signup.terms}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--cream-50)' }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>{t?.signup?.loading || 'Loading...'}</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../components/AuthProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, remainingAnalyses } = useAuthContext();
  const { t, language } = useLanguage();

  // Mock data for demonstration - uses translations
  const mockBiases = [
    { name: t.dashboard.confirmationBias, intensity: 75, description: t.dashboard.confirmationBiasDesc },
    { name: t.dashboard.haloEffect, intensity: 60, description: t.dashboard.haloEffectDesc },
    { name: t.dashboard.lossAversion, intensity: 45, description: t.dashboard.lossAversionDesc },
    { name: t.dashboard.anchoringBias, intensity: 55, description: t.dashboard.anchoringBiasDesc },
  ];

  const mockThinkingPatterns = [
    { name: t.dashboard.analytical, value: 72, color: 'var(--matcha-500)' },
    { name: t.dashboard.creative, value: 58, color: 'var(--terra-400)' },
    { name: t.dashboard.pragmatic, value: 85, color: 'var(--matcha-600)' },
    { name: t.dashboard.emotional, value: 40, color: 'var(--terra-500)' },
  ];

  const mockInsights = [
    t.dashboard.insight1,
    t.dashboard.insight2,
    t.dashboard.insight3,
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--cream-50)' }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  const isPro = user?.plan === 'pro';
  const memberSince = 'Nov 2024';
  const lastAnalysis = language === 'en' ? `2 ${t.dashboard.daysAgo} ago` : `Il y a 2 ${t.dashboard.daysAgo}`;

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -30%)',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl mb-2"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.dashboard.hello}, {user?.prenom}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t.dashboard.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isPro && (
              <div
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: 'var(--cream-200)',
                  color: 'var(--text-secondary)',
                }}
              >
                {remainingAnalyses} {remainingAnalyses !== 1 ? t.dashboard.analysesRemainingPlural : t.dashboard.analysesRemaining}
              </div>
            )}
            <span className={`matcha-badge ${isPro ? 'matcha-badge-pro' : 'matcha-badge-free'}`}>
              {isPro ? 'Pro' : (language === 'en' ? 'Free' : 'Gratuit')}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div
            className="lg:col-span-1 rounded-3xl p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2
              className="text-xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.dashboard.yourProfile}
            </h2>

            {/* Profile Completion */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>{t.dashboard.profileCompletion}</span>
                <span style={{ color: 'var(--matcha-600)' }}>68%</span>
              </div>
              <div className="matcha-progress">
                <div className="matcha-progress-bar" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t.dashboard.analysesCompleted}</span>
                <span style={{ color: 'var(--text-primary)' }} className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t.dashboard.memberSince}</span>
                <span style={{ color: 'var(--text-primary)' }} className="font-medium">{memberSince}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t.dashboard.lastAnalysis}</span>
                <span style={{ color: 'var(--text-primary)' }} className="font-medium">{lastAnalysis}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <Button fullWidth>
                {t.dashboard.startNewAnalysis}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cognitive Biases */}
            <div
              className="rounded-3xl p-6"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h2
                className="text-xl mb-6"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--text-primary)',
                }}
              >
                {t.dashboard.cognitiveBiases}
              </h2>

              <div className="space-y-5">
                {mockBiases.map((bias, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                        {bias.name}
                      </span>
                      <span style={{ color: 'var(--matcha-600)' }}>{bias.intensity}%</span>
                    </div>
                    <div className="matcha-progress mb-2">
                      <div
                        className="matcha-progress-bar"
                        style={{ width: `${bias.intensity}%` }}
                      />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {bias.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thinking Patterns */}
            <div
              className="rounded-3xl p-6"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h2
                className="text-xl mb-6"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--text-primary)',
                }}
              >
                {t.dashboard.thinkingPatterns}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {mockThinkingPatterns.map((pattern, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--cream-100)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {pattern.name}
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: pattern.color }}
                      >
                        {pattern.value}%
                      </span>
                    </div>
                    <div className="matcha-progress">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pattern.value}%`,
                          background: pattern.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div
          className="mt-6 rounded-3xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl mb-6"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.dashboard.personalizedInsights}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {mockInsights.map((insight, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--matcha-50) 0%, var(--cream-100) 100%)',
                  borderLeft: '3px solid var(--matcha-500)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Over Time (Pro only) */}
        <div
          className="mt-6 rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.dashboard.progressTitle}
            </h2>
            {!isPro && (
              <span className="matcha-badge matcha-badge-pro">Pro</span>
            )}
          </div>

          {/* Chart mockup */}
          <div className={`relative ${!isPro ? 'locked-blur' : ''}`}>
            <div className="h-48 flex items-end justify-between gap-2 px-4">
              {[45, 52, 48, 55, 60, 58, 65, 62, 68, 72, 70, 75].map((value, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg"
                  style={{
                    height: `${value}%`,
                    background: `linear-gradient(180deg, var(--matcha-400) 0%, var(--matcha-600) 100%)`,
                    opacity: 0.8 + (i * 0.015),
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Oct 27</span>
              <span>Nov 26</span>
            </div>
          </div>

          {/* Upgrade overlay */}
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
              <div className="text-center p-6">
                <h3
                  className="text-lg mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t.dashboard.unlockProgress}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {t.dashboard.upgradeDesc}
                </p>
                <Link href="/pricing">
                  <Button>{t.dashboard.upgradeToPro}</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

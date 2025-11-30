'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import InteractiveDemo from '@/components/InteractiveDemo';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large organic blob top right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'blob-float 20s ease-in-out infinite',
          }}
        />
        {/* Medium blob left */}
        <div
          className="absolute top-1/3 -left-20 w-[400px] h-[400px] opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: 'blob-float 15s ease-in-out infinite reverse',
          }}
        />
        {/* Small accent blob */}
        <div
          className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] opacity-25"
          style={{
            background: 'radial-gradient(circle, var(--matcha-300) 0%, transparent 70%)',
            borderRadius: '70% 30% 50% 50% / 50% 50% 50% 50%',
            animation: 'blob-float 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div
            className={`flex justify-center mb-8 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'var(--matcha-100)',
                color: 'var(--matcha-700)',
                border: '1px solid var(--matcha-200)',
              }}
            >
              {t.landing.eyebrow}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className={`text-center mb-6 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            {t.landing.headline}
            <br />
            <span className="text-gradient">{t.landing.headlineHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-center max-w-2xl mx-auto mb-10 text-lg transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            {t.landing.subheadline}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link
              href="/signup"
              className="matcha-btn matcha-btn-primary text-base px-8 py-4"
            >
              {t.landing.ctaStart}
            </Link>
            <Link
              href="/test-call"
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              {t.landing.ctaHow}
            </Link>
          </div>

          {/* Hero Visual - Voice Communication */}
          <div
            className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-500 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div
              className="relative rounded-2xl md:rounded-3xl overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at top, #1a2332 0%, #0d1219 100%)',
                border: '1px solid rgba(104, 166, 125, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                minHeight: '400px',
              }}
            >
              {/* Animated gradient orbs in background */}
              <div
                className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{
                  background: 'radial-gradient(circle, var(--matcha-400) 0%, transparent 70%)',
                  animation: 'float-slow 8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{
                  background: 'radial-gradient(circle, var(--terra-400) 0%, transparent 70%)',
                  animation: 'float-slow 10s ease-in-out infinite reverse',
                }}
              />

              {/* Main Content - Responsive Layout */}
              <div className="relative h-full min-h-[400px] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 p-8 md:p-12">

                {/* Left Voice Orb - English */}
                <div className="relative flex flex-col items-center gap-3 z-10">
                  <div className="relative group">
                    {/* Main orb */}
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'linear-gradient(135deg, var(--matcha-400) 0%, var(--matcha-600) 100%)',
                        boxShadow: '0 0 60px rgba(104, 166, 125, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {/* Microphone icon */}
                      <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>

                      {/* Inner glow */}
                      <div
                        className="absolute inset-3 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                          animation: 'pulse-glow 2s ease-in-out infinite',
                        }}
                      />
                    </div>

                    {/* Pulse rings */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: 'rgba(104, 166, 125, 0.4)',
                          animation: `pulse-ring ${2.5 + i * 0.5}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                          animationDelay: `${i * 0.4}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Language badge */}
                  <div
                    className="px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{
                      background: 'rgba(104, 166, 125, 0.15)',
                      border: '1px solid rgba(104, 166, 125, 0.3)',
                    }}
                  >
                    <span className="text-xs md:text-sm font-bold tracking-wider" style={{ color: 'var(--matcha-300)' }}>
                      EN
                    </span>
                  </div>

                  {/* Audio waves */}
                  <div className="flex items-end gap-1 h-16 md:h-20">
                    {[4, 7, 5, 9, 6, 8, 5, 7].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 md:w-1.5 rounded-full"
                        style={{
                          height: `${height * 6}px`,
                          background: 'linear-gradient(to top, var(--matcha-600), var(--matcha-300))',
                          animation: `audio-wave ${0.6 + i * 0.08}s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Center - Live Translation Flow */}
                <div className="flex flex-col items-center justify-center gap-4 md:gap-6 flex-1 max-w-md">

                  {/* Translation stream */}
                  <div className="relative w-full">
                    {/* Flowing connection line */}
                    <div className="relative h-0.5 w-full rounded-full overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, var(--matcha-500) 20%, var(--terra-400) 50%, var(--matcha-500) 80%, transparent 100%)',
                          animation: 'shimmer 3s ease-in-out infinite',
                        }}
                      />
                    </div>

                    {/* Traveling data packets */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 w-3 h-3 rounded-full"
                        style={{
                          background: i % 2 === 0 ? 'var(--matcha-400)' : 'var(--terra-400)',
                          boxShadow: `0 0 15px ${i % 2 === 0 ? 'var(--matcha-400)' : 'var(--terra-400)'}`,
                          transform: 'translateY(-50%)',
                          animation: `travel ${2.5 + i * 0.5}s linear infinite`,
                          animationDelay: `${i * 0.8}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Status card */}
                  <div
                    className="px-5 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-md w-full"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(104, 166, 125, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Status indicator */}
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: '#10b981',
                            boxShadow: '0 0 12px #10b981',
                            animation: 'pulse-dot 1.5s ease-in-out infinite',
                          }}
                        />
                        <span className="text-xs md:text-sm font-medium text-white/90">
                          Live Translation
                        </span>
                      </div>

                      {/* Translation arrow */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-mono text-matcha-300">EN</span>
                        <svg width="60" height="12" viewBox="0 0 60 12" className="flex-shrink-0">
                          <defs>
                            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="var(--matcha-400)" />
                              <stop offset="100%" stopColor="var(--terra-400)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M2 6 L50 6 M45 2 L50 6 L45 10"
                            stroke="url(#arrowGrad)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                        <span className="text-xs font-mono text-terra-300">AR</span>
                      </div>

                      {/* Feature tags */}
                      <div className="flex flex-wrap gap-2 justify-center text-[10px] md:text-xs">
                        <span className="px-2 py-0.5 rounded bg-matcha-500/20 text-matcha-300 border border-matcha-500/30">
                          Voice Clone
                        </span>
                        <span className="px-2 py-0.5 rounded bg-terra-500/20 text-terra-300 border border-terra-500/30">
                          Context-Aware
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Voice Orb - Arabic */}
                <div className="relative flex flex-col items-center gap-3 z-10">
                  <div className="relative group">
                    {/* Main orb */}
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'linear-gradient(135deg, var(--terra-400) 0%, var(--terra-600) 100%)',
                        boxShadow: '0 0 60px rgba(198, 123, 94, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {/* Microphone icon */}
                      <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>

                      {/* Inner glow */}
                      <div
                        className="absolute inset-3 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                          animation: 'pulse-glow 2s ease-in-out infinite 0.3s',
                        }}
                      />
                    </div>

                    {/* Pulse rings */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: 'rgba(198, 123, 94, 0.4)',
                          animation: `pulse-ring ${2.5 + i * 0.5}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                          animationDelay: `${i * 0.4 + 0.3}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Language badge */}
                  <div
                    className="px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{
                      background: 'rgba(198, 123, 94, 0.15)',
                      border: '1px solid rgba(198, 123, 94, 0.3)',
                    }}
                  >
                    <span className="text-xs md:text-sm font-bold tracking-wider" style={{ color: 'var(--terra-300)' }}>
                      AR
                    </span>
                  </div>

                  {/* Audio waves */}
                  <div className="flex items-end gap-1 h-16 md:h-20">
                    {[7, 5, 8, 6, 9, 5, 7, 4].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 md:w-1.5 rounded-full"
                        style={{
                          height: `${height * 6}px`,
                          background: 'linear-gradient(to top, var(--terra-600), var(--terra-300))',
                          animation: `audio-wave ${0.6 + i * 0.08}s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.08 + 0.3}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating info badges - hidden on mobile */}
              <div
                className="hidden md:block absolute top-6 left-6 px-3 py-1.5 rounded-lg backdrop-blur-sm"
                style={{
                  background: 'rgba(104, 166, 125, 0.1)',
                  border: '1px solid rgba(104, 166, 125, 0.2)',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                <span className="text-xs font-medium text-matcha-300">20+ Languages</span>
              </div>
              <div
                className="hidden md:block absolute top-6 right-6 px-3 py-1.5 rounded-lg backdrop-blur-sm"
                style={{
                  background: 'rgba(198, 123, 94, 0.1)',
                  border: '1px solid rgba(198, 123, 94, 0.2)',
                  animation: 'float 4s ease-in-out infinite 0.5s',
                }}
              >
                <span className="text-xs font-medium text-terra-300">Zero Latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.landing.howItWorks}
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.landing.howItWorksDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: t.landing.step1Title,
                description: t.landing.step1Desc,
              },
              {
                step: '02',
                title: t.landing.step2Title,
                description: t.landing.step2Desc,
              },
              {
                step: '03',
                title: t.landing.step3Title,
                description: t.landing.step3Desc,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="matcha-card p-8 relative overflow-hidden group"
              >
                <span
                  className="absolute -top-4 -right-4 text-8xl font-bold opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--matcha-600)',
                  }}
                >
                  {item.step}
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'var(--matcha-100)',
                    color: 'var(--matcha-700)',
                  }}
                >
                  <span
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Features Section */}
      <section
        className="py-24 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.landing.whatReveals}
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.landing.whatRevealsDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: t.landing.cognitiveBiases,
                description: t.landing.cognitiveBiasesDesc,
                color: 'var(--matcha-500)',
              },
              {
                title: t.landing.thoughtPatterns,
                description: t.landing.thoughtPatternsDesc,
                color: 'var(--terra-400)',
              },
              {
                title: t.landing.emotionalBlockers,
                description: t.landing.emotionalBlockersDesc,
                color: 'var(--matcha-600)',
              },
              {
                title: t.landing.psychProfile,
                description: t.landing.psychProfileDesc,
                color: 'var(--terra-500)',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-6 p-6 rounded-2xl transition-all duration-300 hover:bg-white/50"
              >
                <div
                  className="w-1 rounded-full flex-shrink-0"
                  style={{ background: feature.color }}
                />
                <div>
                  <h3
                    className="text-xl mb-2"
                    style={{
                      fontFamily: 'var(--font-dm-serif), Georgia, serif',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section
        className="py-24 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.landing.startFree}
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            {t.landing.startFreeDesc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="matcha-btn matcha-btn-primary text-base px-8 py-4"
            >
              {t.landing.createFreeAccount}
            </Link>
            <Link
              href="/test-call"
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              {t.landing.seePricing}
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-700) 100%)',
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-10"
              style={{
                background: 'radial-gradient(circle, white 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 opacity-10"
              style={{
                background: 'radial-gradient(circle, white 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(-30%, 30%)',
              }}
            />

            <h2
              className="text-3xl md:text-4xl mb-4 relative z-10"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'white',
              }}
            >
              {t.landing.readyToUnderstand}
            </h2>
            <p
              className="mb-8 max-w-xl mx-auto relative z-10"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              {t.landing.joinThousands}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl transition-all relative z-10"
              style={{
                background: 'white',
                color: 'var(--matcha-700)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              }}
            >
              {t.landing.startNow}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-4 border-t"
        style={{
          background: 'var(--cream-50)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--matcha-600)',
                }}
              >
                TRAVoices
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t.landing.footerTagline}
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/pricing"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.pricing}
              </Link>
              <Link
                href="/login"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.login}
              </Link>
              <Link
                href="/signup"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.common.signup}
              </Link>
            </div>
          </div>

          {/* Investor CTA */}
          <div
            className="mt-10 pt-8 border-t"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div
              className="max-w-md mx-auto text-center p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--cream-100) 0%, var(--cream-200) 100%)',
                border: '1px solid var(--matcha-200)',
              }}
            >
              <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--matcha-700)' }}
              >
                {t.landing.investorCta}
              </p>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
              >
                {t.landing.investorMsg}
              </p>
              <a
                href="https://wa.me/213797339451"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium px-5 py-2 rounded-lg transition-all hover:opacity-90"
                style={{
                  background: 'var(--matcha-600)',
                  color: 'white',
                }}
              >
                {t.landing.investorContact}
              </a>
            </div>
          </div>

          <div
            className="mt-8 pt-8 border-t text-center text-sm"
            style={{
              borderColor: 'var(--border-soft)',
              color: 'var(--text-muted)',
            }}
          >
            © 2024 TRAVoices. {t.landing.allRightsReserved}
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.95);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -30px);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-dot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        @keyframes audio-wave {
          0% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes travel {
          0% {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

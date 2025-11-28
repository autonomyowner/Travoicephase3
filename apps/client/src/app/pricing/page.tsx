'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { t, language } = useLanguage();

  const currency = language === 'en' ? '$' : '€';
  const monthlyPrice = language === 'en' ? '15' : '15';
  const yearlyPrice = language === 'en' ? '12' : '12';
  const yearlyTotal = language === 'en' ? '144' : '144';
  const yearlySavings = language === 'en' ? '36' : '36';

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.title}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.pricing.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full" style={{ background: 'var(--cream-200)' }}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{
                color: billingPeriod === 'monthly' ? 'var(--matcha-700)' : 'var(--text-secondary)',
              }}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{
                color: billingPeriod === 'yearly' ? 'var(--matcha-700)' : 'var(--text-secondary)',
              }}
            >
              {t.pricing.yearly}
              <span
                className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--terra-400)',
                  color: 'white',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'var(--matcha-100)',
                    color: 'var(--matcha-700)',
                  }}
                >
                  {t.pricing.free}
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t.pricing.discovery}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    0{currency}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.pricing.perMonth}</span>
                </div>
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.pricing.freeDesc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  t.pricing.freeFeature1,
                  t.pricing.freeFeature2,
                  t.pricing.freeFeature3,
                  t.pricing.freeFeature4,
                  t.pricing.freeFeature5,
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--matcha-500)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup?plan=gratuit"
                className="matcha-btn matcha-btn-secondary w-full justify-center"
              >
                {t.pricing.startFree}
              </Link>
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)',
                boxShadow: '0 20px 60px rgba(104, 166, 125, 0.3)',
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--terra-400)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(224, 123, 76, 0.4)',
                }}
              >
                {t.pricing.mostPopular}
              </div>

              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  {t.pricing.pro}
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'white',
                  }}
                >
                  {t.pricing.transformation}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice}{currency}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t.pricing.perMonth}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t.pricing.billedYearly.replace('{amount}', yearlyTotal + currency).replace('{savings}', yearlySavings + currency)}
                  </p>
                )}
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  {t.pricing.proDesc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  t.pricing.proFeature1,
                  t.pricing.proFeature2,
                  t.pricing.proFeature3,
                  t.pricing.proFeature4,
                  t.pricing.proFeature5,
                  t.pricing.proFeature6,
                  t.pricing.proFeature7,
                  t.pricing.proFeature8,
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'white' }}
                    />
                    <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?plan=pro&billing=${billingPeriod}`}
                className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: 'white',
                  color: 'var(--matcha-700)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }}
              >
                {t.pricing.tryPro}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section
        className="py-20 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl text-center mb-12"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.compareTitle}
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <th
                    className="text-left py-4 px-6 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.pricing.feature}
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.pricing.free}
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--matcha-600)' }}
                  >
                    {t.pricing.pro}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t.pricing.analysesPerMonth, free: '3', pro: t.pricing.unlimited },
                  { feature: t.pricing.psychProfile, free: t.pricing.basic, pro: t.pricing.complete },
                  { feature: t.pricing.biasesDetected, free: t.pricing.mainOnly, pro: t.pricing.all20Plus },
                  { feature: t.pricing.progressTracking, free: t.pricing.no, pro: t.pricing.yes },
                  { feature: t.pricing.personalizedReports, free: t.pricing.no, pro: t.pricing.weekly },
                  { feature: t.pricing.deepAIChat, free: t.pricing.no, pro: t.pricing.yes },
                  { feature: t.pricing.pdfExport, free: t.pricing.yes, pro: t.pricing.yes },
                  { feature: t.pricing.support, free: t.pricing.community, pro: t.pricing.priority },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < 7 ? '1px solid var(--border-soft)' : 'none',
                    }}
                  >
                    <td
                      className="py-4 px-6"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {row.feature}
                    </td>
                    <td
                      className="text-center py-4 px-6"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {row.free}
                    </td>
                    <td
                      className="text-center py-4 px-6 font-medium"
                      style={{ color: 'var(--matcha-600)' }}
                    >
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2
              className="text-2xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.pricing.guaranteeTitle}
            </h2>
            <p
              className="max-w-xl mx-auto mb-6"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              {t.pricing.guaranteeDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                t.pricing.cancelAnytime,
                t.pricing.noCommitment,
                t.pricing.immediateRefund,
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--matcha-500)' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="py-20 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl text-center mb-12"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.faqTitle}
          </h2>

          <div className="space-y-4">
            {[
              { q: t.pricing.faq1Q, a: t.pricing.faq1A },
              { q: t.pricing.faq2Q, a: t.pricing.faq2A },
              { q: t.pricing.faq3Q, a: t.pricing.faq3A },
              { q: t.pricing.faq4Q, a: t.pricing.faq4A },
              { q: t.pricing.faq5Q, a: t.pricing.faq5A },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <summary
                  className="cursor-pointer px-6 py-5 font-medium flex items-center justify-between"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {faq.q}
                  <span
                    className="ml-4 transition-transform group-open:rotate-45"
                    style={{ color: 'var(--matcha-500)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.readyToTransform}
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            {t.pricing.joinThousands}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="matcha-btn matcha-btn-primary text-base px-8 py-4"
            >
              {t.pricing.startFree}
            </Link>
            <Link
              href={`/checkout?plan=pro&billing=${billingPeriod}`}
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              {t.pricing.tryPro}
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
                Matcha
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t.landing.footerTagline}
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.home}
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
          <div
            className="mt-8 pt-8 border-t text-center text-sm"
            style={{
              borderColor: 'var(--border-soft)',
              color: 'var(--text-muted)',
            }}
          >
            © 2024 Matcha. {t.landing.allRightsReserved}
          </div>
        </div>
      </footer>
    </div>
  );
}

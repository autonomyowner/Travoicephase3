'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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
            Des tarifs simples et transparents
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Commencez gratuitement, passez à Pro quand vous êtes prêt. Sans
            engagement, annulable à tout moment.
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
              Mensuel
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
              Annuel
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
                  Gratuit
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  Découverte
                </h2>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    0€
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/mois</span>
                </div>
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Parfait pour découvrir Matcha et comprendre vos premiers
                  schémas de pensée.
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '3 analyses par mois',
                  'Profil psychologique de base',
                  'Identification des biais principaux',
                  'Accès à la communauté',
                  'Export des rapports (PDF)',
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
                Commencer gratuitement
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
                Le plus populaire
              </div>

              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  Pro
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'white',
                  }}
                >
                  Transformation
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {billingPeriod === 'monthly' ? '15€' : '12€'}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>/mois</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Facturé 144€/an (économisez 36€)
                  </p>
                )}
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  Pour ceux qui veulent vraiment transformer leur façon de
                  penser.
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Analyses illimitées',
                  'Profil psychologique complet',
                  'Tous les biais cognitifs détectés',
                  'Suivi de progression mensuel',
                  'Rapports hebdomadaires personnalisés',
                  'Chat IA pour approfondir',
                  'Support prioritaire',
                  'Accès anticipé aux nouvelles fonctionnalités',
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
                Essayer Pro gratuitement 14 jours
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
            Comparez les fonctionnalités
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
                    Fonctionnalité
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Gratuit
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--matcha-600)' }}
                  >
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Analyses par mois', free: '3', pro: 'Illimitées' },
                  { feature: 'Profil psychologique', free: 'Basique', pro: 'Complet' },
                  { feature: 'Biais cognitifs détectés', free: '5 principaux', pro: 'Tous (20+)' },
                  { feature: 'Suivi de progression', free: 'Non', pro: 'Oui' },
                  { feature: 'Rapports personnalisés', free: 'Non', pro: 'Hebdomadaires' },
                  { feature: 'Chat IA approfondi', free: 'Non', pro: 'Oui' },
                  { feature: 'Export PDF', free: 'Oui', pro: 'Oui' },
                  { feature: 'Support', free: 'Communauté', pro: 'Prioritaire' },
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
              Garantie satisfait ou remboursé 30 jours
            </h2>
            <p
              className="max-w-xl mx-auto mb-6"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              Si Matcha ne vous aide pas à mieux comprendre vos schémas de
              pensée, nous vous remboursons intégralement. Sans questions, sans
              conditions.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                'Annulation en 1 clic',
                'Aucun engagement',
                'Remboursement immédiat',
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
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Comment fonctionne l'essai gratuit Pro ?",
                a: "Vous avez accès à toutes les fonctionnalités Pro pendant 14 jours. Aucune carte bancaire requise pour commencer. À la fin de l'essai, vous pouvez choisir de continuer avec Pro ou revenir au plan gratuit.",
              },
              {
                q: 'Puis-je changer de plan à tout moment ?',
                a: 'Oui, vous pouvez passer de Gratuit à Pro ou annuler votre abonnement Pro à tout moment. Les changements prennent effet immédiatement.',
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: 'Absolument. Vos données sont chiffrées et stockées en France. Nous ne partageons jamais vos informations avec des tiers. Vous pouvez demander la suppression de vos données à tout moment.',
              },
              {
                q: "Qu'est-ce qu'une analyse ?",
                a: "Une analyse est une session où vous partagez une situation, un défi ou une décision avec l'IA. Elle identifie vos biais cognitifs, schémas de pensée et génère un rapport personnalisé.",
              },
              {
                q: 'Le paiement est-il sécurisé ?',
                a: 'Oui, tous les paiements sont traités par Stripe, leader mondial du paiement en ligne. Nous ne stockons jamais vos informations bancaires.',
              },
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
            Prêt à transformer votre façon de penser ?
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Rejoignez des milliers de personnes qui ont déjà commencé leur
            voyage avec Matcha.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="matcha-btn matcha-btn-primary text-base px-8 py-4"
            >
              Commencer gratuitement
            </Link>
            <Link
              href={`/checkout?plan=pro&billing=${billingPeriod}`}
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              Essayer Pro 14 jours
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
                L&apos;IA qui comprend votre esprit
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Accueil
              </Link>
              <Link
                href="/login"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Inscription
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
            © 2024 Matcha. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BusinessPage() {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { value: '$4.2T', label: 'Marché mondial du bien-être mental', growth: '+12% /an' },
    { value: '89%', label: 'Des adultes cherchent à mieux se comprendre', growth: 'Tendance croissante' },
    { value: '3x', label: 'ROI moyen des apps de développement personnel', growth: 'vs apps traditionnelles' },
    { value: '72%', label: 'Taux de rétention avec IA personnalisée', growth: 'vs 23% standard' },
  ];

  const roadmap = [
    { phase: 'Phase 1', title: 'MVP & Validation', status: 'completed', items: ['Analyse cognitive IA', 'Détection des biais', 'Interface conversationnelle', '10K utilisateurs beta'] },
    { phase: 'Phase 2', title: 'Croissance', status: 'current', items: ['Expansion B2B entreprises', 'API pour thérapeutes', 'Partenariats cliniques', '100K utilisateurs'] },
    { phase: 'Phase 3', title: 'Scale', status: 'upcoming', items: ['Expansion internationale', 'Certification médicale', 'Intégration assurances', '1M utilisateurs'] },
    { phase: 'Phase 4', title: 'Domination', status: 'upcoming', items: ['Plateforme entreprise', 'White-label solution', 'Acquisition stratégique', '10M utilisateurs'] },
  ];

  const investmentTiers = [
    { amount: '50K - 100K €', equity: '0.5% - 1%', perks: ['Accès early investor', 'Rapport mensuel', 'Badge fondateur'] },
    { amount: '100K - 250K €', equity: '1% - 2.5%', perks: ['Tout précédent', 'Call trimestriel CEO', 'Advisory board invite'] },
    { amount: '250K - 500K €', equity: '2.5% - 5%', perks: ['Tout précédent', 'Siège observateur board', 'Co-branding opportunités'] },
    { amount: '500K+ €', equity: '5%+', perks: ['Tout précédent', 'Siège board', 'Droits de préemption', 'Due diligence complète'] },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Hero Section - Cinematic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, var(--matcha-200) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, var(--terra-200) 0%, transparent 50%)',
            }}
          />
          {/* Floating particles */}
          {mounted && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-20"
              style={{
                background: i % 2 === 0 ? 'var(--matcha-400)' : 'var(--terra-400)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              background: 'linear-gradient(135deg, var(--terra-400) 0%, var(--terra-500) 100%)',
              color: 'white',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium">Opportunité d&apos;investissement exclusive</span>
          </div>

          {/* Main Title */}
          <h1
            className={`mb-6 transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            L&apos;IA qui révolutionne
            <br />
            <span className="text-gradient">la compréhension de soi</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            Matcha utilise l&apos;intelligence artificielle pour analyser les schémas de pensée,
            identifier les biais cognitifs et transformer des millions de vies.
            <strong style={{ color: 'var(--matcha-600)' }}> Rejoignez la révolution.</strong>
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <a
              href="#investment"
              className="matcha-btn matcha-btn-primary text-lg px-10 py-5"
            >
              Devenir investisseur
            </a>
            <a
              href="#vision"
              className="matcha-btn matcha-btn-secondary text-lg px-10 py-5"
            >
              Découvrir la vision
            </a>
          </div>

          {/* Animated Metrics */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-1000 delay-800 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {metrics.map((metric, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl transition-all duration-500 ${
                  activeMetric === i ? 'scale-105' : 'scale-100 opacity-70'
                }`}
                style={{
                  background: activeMetric === i
                    ? 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)'
                    : 'var(--bg-card)',
                  color: activeMetric === i ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <p
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
                >
                  {metric.value}
                </p>
                <p className={`text-sm ${activeMetric === i ? 'opacity-90' : 'opacity-70'}`}>
                  {metric.label}
                </p>
                <p
                  className={`text-xs mt-2 font-medium ${
                    activeMetric === i ? 'text-white/80' : ''
                  }`}
                  style={{ color: activeMetric !== i ? 'var(--matcha-600)' : undefined }}
                >
                  {metric.growth}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div
            className="w-8 h-12 rounded-full border-2 flex items-start justify-center p-2"
            style={{ borderColor: 'var(--matcha-400)' }}
          >
            <div
              className="w-1.5 h-3 rounded-full animate-pulse"
              style={{ background: 'var(--matcha-500)' }}
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 px-4" style={{ background: 'var(--cream-100)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: 'var(--matcha-100)',
                color: 'var(--matcha-700)',
              }}
            >
              Notre Vision
            </span>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Démocratiser l&apos;introspection
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              La thérapie coûte cher. Les coachs sont inaccessibles. Les livres de développement
              personnel ne suffisent pas. Matcha rend l&apos;analyse psychologique profonde
              accessible à tous, instantanément.
            </p>
          </div>

          {/* Problem/Solution Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Problem */}
            <div
              className="p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, var(--terra-100) 0%, var(--cream-200) 100%)',
                border: '1px solid var(--terra-200)',
              }}
            >
              <h3
                className="text-2xl mb-6"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--terra-600)',
                }}
              >
                Le Problème
              </h3>
              <ul className="space-y-4">
                {[
                  '80% des gens ne comprennent pas leurs propres biais cognitifs',
                  'La thérapie coûte 60-150€/séance, inaccessible pour la majorité',
                  'Les apps actuelles offrent des conseils génériques sans personnalisation',
                  'Le burn-out et l\'anxiété explosent (+40% post-COVID)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                      style={{ background: 'var(--terra-200)', color: 'var(--terra-600)' }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div
              className="p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, var(--matcha-100) 0%, var(--cream-200) 100%)',
                border: '1px solid var(--matcha-200)',
              }}
            >
              <h3
                className="text-2xl mb-6"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--matcha-700)',
                }}
              >
                Notre Solution
              </h3>
              <ul className="space-y-4">
                {[
                  'IA conversationnelle qui analyse vos schémas de pensée en temps réel',
                  'Abonnement accessible : 15€/mois pour des analyses illimitées',
                  'Personnalisation profonde basée sur votre historique unique',
                  'Insights actionnables et suivi de progression mesurable',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--matcha-500)', color: 'white' }}
                    >
                      ✓
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Technical */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: 'var(--terra-100)',
                color: 'var(--terra-600)',
              }}
            >
              Technologie
            </span>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Comment ça marche
            </h2>
          </div>

          {/* Tech Stack Visual */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Conversation IA',
                description: 'Notre LLM fine-tuné pose des questions ciblées pour comprendre votre contexte mental unique.',
                tech: 'GPT-4 fine-tuned + RAG',
              },
              {
                step: '02',
                title: 'Analyse Cognitive',
                description: 'Algorithmes propriétaires détectent 50+ biais cognitifs et schémas de pensée récurrents.',
                tech: 'ML Pipeline + NLP avancé',
              },
              {
                step: '03',
                title: 'Insights Personnalisés',
                description: 'Génération de rapports actionnables avec recommandations basées sur la psychologie clinique.',
                tech: 'Knowledge Graph + CBT Framework',
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
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, var(--matcha-400) 0%, var(--matcha-600) 100%)',
                    color: 'white',
                  }}
                >
                  <span className="text-xl font-bold">{item.step}</span>
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
                <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.description}
                </p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--matcha-100)',
                    color: 'var(--matcha-700)',
                  }}
                >
                  {item.tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-24 px-4" style={{ background: 'var(--cream-100)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: 'var(--matcha-100)',
                color: 'var(--matcha-700)',
              }}
            >
              Business Model
            </span>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Modèle de revenus scalable
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'B2C Freemium',
                revenue: '40%',
                description: 'Abonnement Pro à 15€/mois après 3 analyses gratuites',
                color: 'var(--matcha-500)',
              },
              {
                title: 'B2B Entreprises',
                revenue: '35%',
                description: 'Licence entreprise pour le bien-être des employés',
                color: 'var(--matcha-600)',
              },
              {
                title: 'API Thérapeutes',
                revenue: '15%',
                description: 'Outils d\'analyse pour professionnels de santé mentale',
                color: 'var(--terra-400)',
              },
              {
                title: 'White Label',
                revenue: '10%',
                description: 'Solution en marque blanche pour partenaires',
                color: 'var(--terra-500)',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: item.color, color: 'white' }}
                >
                  <span className="text-xl font-bold">{item.revenue}</span>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue Projection */}
          <div
            className="mt-16 p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-700) 100%)',
            }}
          >
            <h3
              className="text-2xl text-center mb-8"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'white',
              }}
            >
              Projection de revenus
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              {[
                { year: '2024', revenue: '500K €', users: '50K' },
                { year: '2025', revenue: '2M €', users: '200K' },
                { year: '2026', revenue: '8M €', users: '800K' },
                { year: '2027', revenue: '25M €', users: '2.5M' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-lg opacity-80 mb-1">{item.year}</p>
                  <p
                    className="text-3xl font-bold mb-1"
                    style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
                  >
                    {item.revenue}
                  </p>
                  <p className="text-sm opacity-70">{item.users} utilisateurs</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: 'var(--terra-100)',
                color: 'var(--terra-600)',
              }}
            >
              Roadmap
            </span>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Notre trajectoire
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {roadmap.map((phase, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl relative ${
                  phase.status === 'current' ? 'ring-2 ring-[#68a67d]' : ''
                }`}
                style={{
                  background: phase.status === 'completed'
                    ? 'linear-gradient(135deg, var(--matcha-100) 0%, var(--matcha-50) 100%)'
                    : phase.status === 'current'
                    ? 'var(--bg-card)'
                    : 'var(--cream-100)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {phase.status === 'current' && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--matcha-500)',
                      color: 'white',
                    }}
                  >
                    En cours
                  </span>
                )}
                <p
                  className="text-sm font-medium mb-2"
                  style={{
                    color: phase.status === 'completed' ? 'var(--matcha-600)' : 'var(--terra-500)',
                  }}
                >
                  {phase.phase}
                </p>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {phase.title}
                </h3>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: phase.status === 'completed' ? 'var(--matcha-500)' : 'var(--cream-400)',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section id="investment" className="py-24 px-4" style={{ background: 'var(--cream-100)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--terra-400) 0%, var(--terra-500) 100%)',
                color: 'white',
              }}
            >
              Investissement
            </span>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Rejoignez l&apos;aventure
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nous levons 1M € en seed pour accélérer notre croissance.
              Plusieurs tiers d&apos;investissement disponibles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {investmentTiers.map((tier, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl ${i === 2 ? 'ring-2 ring-matcha-500 relative' : ''}`}
                style={{
                  background: i === 2
                    ? 'linear-gradient(135deg, var(--matcha-50) 0%, var(--cream-100) 100%)'
                    : 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {i === 2 && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--matcha-500)',
                      color: 'white',
                    }}
                  >
                    Populaire
                  </span>
                )}
                <p
                  className="text-2xl font-bold mb-1"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {tier.amount}
                </p>
                <p
                  className="text-lg font-medium mb-4"
                  style={{ color: 'var(--matcha-600)' }}
                >
                  {tier.equity} equity
                </p>
                <ul className="space-y-2">
                  {tier.perks.map((perk, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span style={{ color: 'var(--matcha-500)' }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className="p-12 rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, var(--terra-400) 0%, var(--terra-600) 100%)',
            }}
          >
            <h3
              className="text-3xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'white',
              }}
            >
              Prêt à transformer le futur du bien-être mental ?
            </h3>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Contactez-nous pour recevoir notre deck investisseur complet
            </p>
            <a
              href="mailto:invest@matcha.ai"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-medium rounded-xl transition-all hover:scale-105"
              style={{
                background: 'white',
                color: 'var(--terra-600)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              }}
            >
              Contacter l&apos;équipe fondatrice
            </a>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              background: 'var(--matcha-100)',
              color: 'var(--matcha-700)',
            }}
          >
            L&apos;équipe
          </span>
          <h2
            className="text-4xl md:text-5xl mb-6"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            Fondateurs passionnés
          </h2>
          <p
            className="text-xl mb-12"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            Une équipe combinant expertise en IA, psychologie et entrepreneuriat
            pour créer l&apos;avenir du développement personnel.
          </p>

          <div
            className="p-8 rounded-3xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <p
              className="text-lg italic mb-6"
              style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}
            >
              &ldquo;Nous croyons que la compréhension de soi ne devrait pas être un luxe.
              Avec Matcha, nous démocratisons l&apos;accès à une introspection profonde
              et transformatrice. Notre mission : aider 100 millions de personnes
              à mieux se comprendre d&apos;ici 2030.&rdquo;
            </p>
            <p className="font-semibold" style={{ color: 'var(--matcha-600)' }}>
              — L&apos;équipe fondatrice de Matcha
            </p>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 px-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--matcha-600)' }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}

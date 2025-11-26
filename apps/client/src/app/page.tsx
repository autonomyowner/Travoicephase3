'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

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
              Intelligence artificielle au service de votre esprit
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
            Comprenez votre esprit.
            <br />
            <span className="text-gradient">Transformez votre vie.</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-center max-w-2xl mx-auto mb-10 text-lg transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            Matcha analyse vos schémas de pensée, identifie vos biais cognitifs,
            et vous révèle les racines profondes de vos blocages. Une approche
            révolutionnaire du développement personnel.
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
              Commencer gratuitement
            </Link>
            <Link
              href="#comment-ca-marche"
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              Découvrir comment ça marche
            </Link>
          </div>

          {/* Hero Visual - Abstract Brain Pattern */}
          <div
            className={`relative max-w-3xl mx-auto transition-all duration-1000 delay-500 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--cream-100) 0%, var(--cream-200) 100%)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-xl)',
                aspectRatio: '16/9',
              }}
            >
              {/* Abstract visualization representing mind analysis */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Central element */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, var(--matcha-400) 0%, var(--matcha-600) 100%)',
                      boxShadow: '0 0 60px rgba(104, 166, 125, 0.4)',
                    }}
                  />
                  {/* Orbiting elements */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        width: `${180 + i * 60}px`,
                        height: `${180 + i * 60}px`,
                        marginLeft: `-${(180 + i * 60) / 2}px`,
                        marginTop: `-${(180 + i * 60) / 2}px`,
                        border: `1px solid rgba(104, 166, 125, ${0.3 - i * 0.04})`,
                        borderRadius: '50%',
                        animation: `spin ${20 + i * 5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                      }}
                    >
                      <div
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          background: i % 2 === 0 ? 'var(--matcha-500)' : 'var(--terra-400)',
                          top: '0',
                          left: '50%',
                          marginLeft: '-6px',
                          marginTop: '-6px',
                        }}
                      />
                    </div>
                  ))}
                  {/* Floating labels */}
                  <div
                    className="absolute top-1/4 left-1/4 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--matcha-700)',
                      boxShadow: 'var(--shadow-md)',
                      animation: 'float 4s ease-in-out infinite',
                    }}
                  >
                    Biais cognitifs
                  </div>
                  <div
                    className="absolute top-1/3 right-1/4 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--terra-500)',
                      boxShadow: 'var(--shadow-md)',
                      animation: 'float 5s ease-in-out infinite 1s',
                    }}
                  >
                    Schémas de pensée
                  </div>
                  <div
                    className="absolute bottom-1/3 left-1/3 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--matcha-600)',
                      boxShadow: 'var(--shadow-md)',
                      animation: 'float 4.5s ease-in-out infinite 0.5s',
                    }}
                  >
                    Analyse profonde
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4" style={{ background: 'var(--cream-100)' }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-center text-sm font-medium mb-8"
            style={{ color: 'var(--text-muted)' }}
          >
            Déjà adopté par des milliers de personnes en France
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['4.9/5 satisfaction', '+10 000 analyses', '97% recommandent'].map(
              (stat, i) => (
                <div key={i} className="text-center">
                  <p
                    className="text-2xl font-semibold"
                    style={{
                      fontFamily: 'var(--font-dm-serif), Georgia, serif',
                      color: 'var(--matcha-600)',
                    }}
                  >
                    {stat.split(' ')[0]}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="comment-ca-marche" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Comment ça marche
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Un processus simple en trois étapes pour comprendre et transformer
              votre façon de penser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Partagez vos pensées',
                description:
                  "Décrivez une situation, un défi ou une décision que vous souhaitez analyser. L'IA vous pose des questions ciblées pour comprendre votre contexte.",
              },
              {
                step: '02',
                title: 'Analyse approfondie',
                description:
                  "Notre IA identifie vos schémas de pensée récurrents, détecte les biais cognitifs qui influencent vos décisions et révèle les causes profondes de vos blocages.",
              },
              {
                step: '03',
                title: 'Insights personnalisés',
                description:
                  "Recevez un rapport détaillé avec des recommandations concrètes pour transformer vos schémas de pensée et atteindre vos objectifs.",
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
              Ce que Matcha révèle
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Une analyse psychologique profonde pour comprendre ce qui vous
              empêche d&apos;avancer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Biais cognitifs',
                description:
                  "Identifiez les biais inconscients qui faussent votre jugement : biais de confirmation, effet de halo, aversion à la perte, et bien d'autres.",
                color: 'var(--matcha-500)',
              },
              {
                title: 'Schémas de pensée',
                description:
                  'Découvrez vos patterns de réflexion récurrents et comprenez comment ils influencent vos décisions au quotidien.',
                color: 'var(--terra-400)',
              },
              {
                title: 'Blocages émotionnels',
                description:
                  'Mettez en lumière les freins émotionnels qui vous empêchent de passer à l\'action et atteignez vos objectifs.',
                color: 'var(--matcha-600)',
              },
              {
                title: 'Profil psychologique',
                description:
                  'Obtenez une vue d\'ensemble de votre fonctionnement mental avec des insights actionnables pour votre développement personnel.',
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

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Ils ont transformé leur vie
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Matcha m'a permis de comprendre pourquoi je procrastinais sur mes projets importants. Les insights étaient incroyablement précis.",
                name: 'Marie L.',
                role: 'Entrepreneure, Paris',
              },
              {
                quote:
                  "J'ai enfin compris mes schémas de pensée qui me bloquaient dans ma carrière. Une vraie révélation.",
                name: 'Thomas D.',
                role: 'Manager, Lyon',
              },
              {
                quote:
                  "L'analyse de mes biais cognitifs a changé ma façon de prendre des décisions. Je recommande à 100%.",
                name: 'Sophie M.',
                role: 'Consultante, Bordeaux',
              },
            ].map((testimonial, i) => (
              <div key={i} className="matcha-card p-6">
                <p
                  className="mb-6 text-lg"
                  style={{
                    color: 'var(--text-primary)',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {testimonial.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {testimonial.role}
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
            Commencez gratuitement
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            3 analyses offertes chaque mois. Passez à Pro pour des analyses
            illimitées et un suivi personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="matcha-btn matcha-btn-primary text-base px-8 py-4"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              href="/pricing"
              className="matcha-btn matcha-btn-secondary text-base px-8 py-4"
            >
              Voir les tarifs
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
              Prêt à comprendre votre esprit ?
            </h2>
            <p
              className="mb-8 max-w-xl mx-auto relative z-10"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Rejoignez des milliers de personnes qui ont transformé leur façon
              de penser grâce à Matcha.
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
              Commencer maintenant
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
                href="/pricing"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tarifs
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
      `}</style>
    </div>
  );
}

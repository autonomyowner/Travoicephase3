'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
  delay: number;
}

interface AnalyticsData {
  biases: { name: string; percentage: number; color: string }[];
  emotionalState: { label: string; value: string };
  thinkingPattern: string;
  insight: string;
}

const demoMessages: Message[] = [
  {
    type: 'user',
    text: "Je procrastine beaucoup sur un projet important au travail. Je n'arrive pas à m'y mettre.",
    delay: 0,
  },
  {
    type: 'ai',
    text: "Je comprends. Pouvez-vous me décrire ce que vous ressentez quand vous pensez à ce projet ?",
    delay: 2500,
  },
  {
    type: 'user',
    text: "Je ressens une sorte d'anxiété... j'ai peur de ne pas être à la hauteur.",
    delay: 5500,
  },
  {
    type: 'ai',
    text: "Merci pour votre honnêteté. Avez-vous déjà vécu une situation similaire où vous avez réussi malgré vos doutes ?",
    delay: 8500,
  },
  {
    type: 'user',
    text: "Oui, plusieurs fois en fait. Mais à chaque fois j'oublie ces réussites.",
    delay: 12000,
  },
];

const analyticsData: AnalyticsData = {
  biases: [
    { name: 'Biais de négativité', percentage: 78, color: 'var(--terra-400)' },
    { name: 'Syndrome de l\'imposteur', percentage: 85, color: 'var(--matcha-500)' },
    { name: 'Aversion à la perte', percentage: 62, color: 'var(--terra-500)' },
  ],
  emotionalState: {
    label: 'État émotionnel dominant',
    value: 'Anxiété de performance',
  },
  thinkingPattern: 'Perfectionnisme paralysant',
  insight: 'Tendance à minimiser les succès passés et amplifier les risques futurs.',
};

export default function InteractiveDemo() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsProgress, setAnalyticsProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Intersection observer to start animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setIsInView(true);
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  // Main animation sequence
  useEffect(() => {
    if (!isInView) return;

    const showNextMessage = (index: number) => {
      if (index >= demoMessages.length) {
        // All messages shown, start analytics
        setTimeout(() => {
          setShowAnalytics(true);
          animateAnalytics();
        }, 1500);
        return;
      }

      const message = demoMessages[index];
      setCurrentTypingIndex(index);
      setIsTyping(true);
      setTypingMessage('');

      // Typing animation
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex <= message.text.length) {
          setTypingMessage(message.text.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setVisibleMessages(index + 1);
          setCurrentTypingIndex(-1);

          // Schedule next message
          const nextDelay = index + 1 < demoMessages.length
            ? demoMessages[index + 1].delay - message.delay - (message.text.length * 30) - 500
            : 0;

          setTimeout(() => showNextMessage(index + 1), Math.max(nextDelay, 800));
        }
      }, 30);
    };

    // Start the sequence
    const startTimeout = setTimeout(() => showNextMessage(0), 1000);
    return () => clearTimeout(startTimeout);
  }, [isInView]);

  // Scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, typingMessage]);

  const animateAnalytics = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAnalyticsProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 30);
  };

  const resetDemo = () => {
    setVisibleMessages(0);
    setTypingMessage('');
    setIsTyping(false);
    setCurrentTypingIndex(-1);
    setShowAnalytics(false);
    setAnalyticsProgress(0);
    setHasStarted(false);
    setTimeout(() => {
      setIsInView(true);
      setHasStarted(true);
    }, 100);
  };

  return (
    <section className="py-24 px-4" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              background: 'var(--matcha-100)',
              color: 'var(--matcha-700)',
              border: '1px solid var(--matcha-200)',
            }}
          >
            Démo interactive
          </span>
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            Voyez Matcha en action
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Découvrez comment notre IA analyse vos pensées et révèle des insights profonds en quelques échanges.
          </p>
        </div>

        {/* Demo Container - Screen Recording Style */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--cream-100) 0%, var(--cream-200) 100%)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Browser-like header */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{
              background: 'var(--cream-50)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--terra-400)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--cream-400)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--matcha-400)' }} />
            </div>
            <div
              className="flex-1 mx-4 px-4 py-1.5 rounded-lg text-sm text-center"
              style={{
                background: 'var(--cream-100)',
                color: 'var(--text-muted)',
              }}
            >
              app.matcha.ai/analyse
            </div>
            <button
              onClick={resetDemo}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--matcha-100)',
                color: 'var(--matcha-700)',
              }}
            >
              Rejouer
            </button>
          </div>

          {/* Main content area */}
          <div className="grid lg:grid-cols-2 gap-0 lg:gap-0">
            {/* Chat Section */}
            <div
              className="p-6 lg:border-r"
              style={{ borderColor: 'var(--border-soft)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--matcha-100)' }}
                >
                  <span style={{ color: 'var(--matcha-600)' }}>M</span>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Session d&apos;analyse
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Matcha AI
                  </p>
                </div>
              </div>

              {/* Chat messages */}
              <div
                ref={chatRef}
                className="space-y-4 h-[320px] overflow-y-auto pr-2 scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--matcha-200) transparent',
                }}
              >
                {/* Initial AI greeting */}
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                    style={{ background: 'var(--matcha-100)', color: 'var(--matcha-600)' }}
                  >
                    M
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-md max-w-[85%]"
                    style={{
                      background: 'var(--cream-50)',
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      Bonjour ! Je suis là pour vous aider à mieux comprendre vos schémas de pensée.
                      Qu&apos;est-ce qui vous préoccupe en ce moment ?
                    </p>
                  </div>
                </div>

                {/* Dynamic messages */}
                {demoMessages.slice(0, visibleMessages).map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                      style={{
                        background: message.type === 'user' ? 'var(--terra-100)' : 'var(--matcha-100)',
                        color: message.type === 'user' ? 'var(--terra-600)' : 'var(--matcha-600)',
                      }}
                    >
                      {message.type === 'user' ? 'V' : 'M'}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                        message.type === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
                      }`}
                      style={{
                        background: message.type === 'user' ? 'var(--matcha-500)' : 'var(--cream-50)',
                        color: message.type === 'user' ? 'white' : 'var(--text-primary)',
                        border: message.type === 'user' ? 'none' : '1px solid var(--border-soft)',
                      }}
                    >
                      <p className="text-sm" style={{ lineHeight: 1.6 }}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && currentTypingIndex >= 0 && (
                  <div
                    className={`flex gap-3 ${demoMessages[currentTypingIndex].type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                      style={{
                        background: demoMessages[currentTypingIndex].type === 'user' ? 'var(--terra-100)' : 'var(--matcha-100)',
                        color: demoMessages[currentTypingIndex].type === 'user' ? 'var(--terra-600)' : 'var(--matcha-600)',
                      }}
                    >
                      {demoMessages[currentTypingIndex].type === 'user' ? 'V' : 'M'}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                        demoMessages[currentTypingIndex].type === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
                      }`}
                      style={{
                        background: demoMessages[currentTypingIndex].type === 'user' ? 'var(--matcha-500)' : 'var(--cream-50)',
                        color: demoMessages[currentTypingIndex].type === 'user' ? 'white' : 'var(--text-primary)',
                        border: demoMessages[currentTypingIndex].type === 'user' ? 'none' : '1px solid var(--border-soft)',
                      }}
                    >
                      <p className="text-sm" style={{ lineHeight: 1.6 }}>
                        {typingMessage}
                        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: 'currentColor' }} />
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fake input */}
              <div
                className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
                style={{
                  background: 'var(--cream-50)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Écrivez votre message...
                </span>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="p-6" style={{ background: 'var(--cream-50)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-medium"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  Analyse en temps réel
                </h3>
                {showAnalytics && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--matcha-100)',
                      color: 'var(--matcha-700)',
                    }}
                  >
                    Analyse complète
                  </span>
                )}
              </div>

              {!showAnalytics ? (
                <div className="space-y-4 h-[340px] flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--matcha-100)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full animate-pulse"
                      style={{ background: 'var(--matcha-300)' }}
                    />
                  </div>
                  <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                    L&apos;IA analyse la conversation...
                    <br />
                    <span className="text-xs">Les insights apparaîtront ici</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-5 h-[340px] overflow-y-auto">
                  {/* Emotional State */}
                  <div
                    className="p-4 rounded-xl transition-all duration-500"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-soft)',
                      opacity: analyticsProgress > 20 ? 1 : 0,
                      transform: analyticsProgress > 20 ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                      {analyticsData.emotionalState.label}
                    </p>
                    <p
                      className="text-lg font-medium"
                      style={{
                        fontFamily: 'var(--font-dm-serif), Georgia, serif',
                        color: 'var(--terra-500)',
                      }}
                    >
                      {analyticsData.emotionalState.value}
                    </p>
                  </div>

                  {/* Thinking Pattern */}
                  <div
                    className="p-4 rounded-xl transition-all duration-500"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-soft)',
                      opacity: analyticsProgress > 40 ? 1 : 0,
                      transform: analyticsProgress > 40 ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                      Schéma de pensée détecté
                    </p>
                    <p
                      className="text-lg font-medium"
                      style={{
                        fontFamily: 'var(--font-dm-serif), Georgia, serif',
                        color: 'var(--matcha-600)',
                      }}
                    >
                      {analyticsData.thinkingPattern}
                    </p>
                  </div>

                  {/* Cognitive Biases */}
                  <div
                    className="p-4 rounded-xl transition-all duration-500"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-soft)',
                      opacity: analyticsProgress > 60 ? 1 : 0,
                      transform: analyticsProgress > 60 ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                      Biais cognitifs identifiés
                    </p>
                    <div className="space-y-3">
                      {analyticsData.biases.map((bias, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {bias.name}
                            </span>
                            <span className="text-sm font-medium" style={{ color: bias.color }}>
                              {Math.round((analyticsProgress / 100) * bias.percentage)}%
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: 'var(--cream-200)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${(analyticsProgress / 100) * bias.percentage}%`,
                                background: bias.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insight */}
                  <div
                    className="p-4 rounded-xl transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, var(--matcha-50) 0%, var(--cream-100) 100%)',
                      borderLeft: '3px solid var(--matcha-500)',
                      opacity: analyticsProgress > 85 ? 1 : 0,
                      transform: analyticsProgress > 85 ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--matcha-700)' }}>
                      Insight clé
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {analyticsData.insight}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Prêt à découvrir vos propres schémas de pensée ?
          </p>
          <a
            href="/signup"
            className="matcha-btn matcha-btn-primary text-base px-8 py-4 inline-block"
          >
            Commencer mon analyse gratuite
          </a>
        </div>
      </div>
    </section>
  );
}

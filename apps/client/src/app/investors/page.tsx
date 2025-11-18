"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function InvestorsPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const whatsappNumber = "966535523013"
  const whatsappMessage = "Hello, I'm interested in learning more about TRAVoices investment opportunity"
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="space-y-12 sm:space-y-16 relative pb-8">
      {/* Background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#fff8dc',
          backgroundImage: 'radial-gradient(rgba(201,162,39,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Hero Section */}
      <section className="text-center space-y-4 sm:space-y-6 text-slate-900 px-2 pt-4">
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-600/30 text-xs sm:text-sm font-semibold text-slate-800 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          Investor Deck — TRAVoices
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 transition-all duration-1000 ease-out delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          Breaking the Last Barrier to <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Global Communication</span>
        </h1>
        <p className={`mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-slate-700 px-2 transition-all duration-1000 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          The world speaks 7,000+ languages. Business happens in real-time. TRAVoices makes both possible — simultaneously.
        </p>
      </section>

      {/* The Problem */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">The Problem</h2>
        <div className="space-y-3 text-sm sm:text-base text-slate-800">
          <p className="text-base sm:text-lg font-semibold text-slate-900">
            Real-time voice translation doesn't exist — and it's costing billions.
          </p>
          <ul className="space-y-2 ml-6 list-disc">
            <li>International business meetings require interpreters ($200-500/hour)</li>
            <li>Customer support teams need multilingual staff for every market</li>
            <li>Global conferences are limited by language tracks and subtitle delays</li>
            <li>Telemedicine can't scale across language barriers</li>
            <li>Education remains siloed by geography and language</li>
          </ul>
          <div className="pt-2 border-t border-black/10 mt-4">
            <p className="font-semibold text-slate-900">Current solutions fall short:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="font-semibold text-sm text-red-900">Human Interpreters</p>
                <p className="text-xs text-red-800 mt-1">Expensive, not scalable, scheduling delays</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="font-semibold text-sm text-red-900">Text Translation Apps</p>
                <p className="text-xs text-red-800 mt-1">Lose tone, emotion, context; awkward pauses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">The Solution</h2>
        <p className="text-base sm:text-lg font-semibold text-slate-900">
          TRAVoices: Real-time voice translation that preserves your voice, tone, and emotion.
        </p>
        <p className="text-sm sm:text-base text-slate-800">
          Speak naturally in your language. Be heard instantly in theirs — with your own cloned voice carrying the same emotion, cadence, and personality.
        </p>

        {/* How It Works */}
        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">How It Works</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="font-semibold text-sm text-slate-900">1. Speech Recognition</p>
              <p className="text-xs text-slate-700 mt-1">Deepgram STT captures speech in any language with 95%+ accuracy</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <p className="font-semibold text-sm text-slate-900">2. Contextual Translation</p>
              <p className="text-xs text-slate-700 mt-1">DeepL API translates with cultural context, idioms, and intent</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <p className="font-semibold text-sm text-slate-900">3. Voice Synthesis</p>
              <p className="text-xs text-slate-700 mt-1">ElevenLabs TTS clones your voice in the target language</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300">
            <p className="font-semibold text-sm text-slate-900">Total Latency: &lt;2 seconds</p>
            <p className="text-xs text-slate-700 mt-1">Fast enough for natural conversation flow</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">What Makes Us Different</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">Voice Cloning</p>
              <p className="text-xs text-slate-700 mt-1">Your voice, your identity — preserved across languages</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">Cultural Context</p>
              <p className="text-xs text-slate-700 mt-1">Understand idioms, humor, and cultural nuance</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">Real-Time Performance</p>
              <p className="text-xs text-slate-700 mt-1">LiveKit infrastructure for &lt;300ms translation</p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <p className="font-semibold text-sm text-slate-900">Multi-Language Support</p>
              <p className="text-xs text-slate-700 mt-1">50+ languages and dialects, continuously expanding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Technology Stack</h2>
        <p className="text-sm sm:text-base text-slate-800">
          Built on battle-tested infrastructure with best-in-class AI providers:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Frontend</p>
            <p className="text-xs text-slate-700 mt-1">Next.js 15, React 19, Tailwind CSS</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Real-Time Voice</p>
            <p className="text-xs text-slate-700 mt-1">LiveKit (WebRTC, ultra-low latency)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">AI Translation</p>
            <p className="text-xs text-slate-700 mt-1">DeepL API (99% accuracy)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Voice Synthesis</p>
            <p className="text-xs text-slate-700 mt-1">ElevenLabs (multilingual TTS)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Speech Recognition</p>
            <p className="text-xs text-slate-700 mt-1">Deepgram (95%+ accuracy)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Backend</p>
            <p className="text-xs text-slate-700 mt-1">Node.js, Express, Python agents</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Database</p>
            <p className="text-xs text-slate-700 mt-1">Supabase (PostgreSQL + Auth)</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Deployment</p>
            <p className="text-xs text-slate-700 mt-1">Vercel, Render, Docker</p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Development Roadmap</h2>

        <div className="space-y-4">
          {/* Phase 1 - Completed */}
          <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-green-900">Phase 1: Foundation (Completed)</h3>
              <span className="text-xs font-semibold text-green-700 px-2 py-1 rounded bg-green-200">LIVE</span>
            </div>
            <ul className="space-y-1 text-sm text-green-800 ml-4 list-disc">
              <li>Real-time voice rooms with LiveKit integration</li>
              <li>Multi-language UI (English + Arabic with RTL support)</li>
              <li>User authentication and room management</li>
              <li>Basic voice recording and playback</li>
            </ul>
          </div>

          {/* Phase 2 - Current */}
          <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-blue-900">Phase 2: Translation Engine (Current)</h3>
              <span className="text-xs font-semibold text-blue-700 px-2 py-1 rounded bg-blue-200">IN PROGRESS</span>
            </div>
            <ul className="space-y-1 text-sm text-blue-800 ml-4 list-disc">
              <li>Python agent worker for real-time translation</li>
              <li>Deepgram STT integration (multi-language)</li>
              <li>DeepL translation API integration</li>
              <li>ElevenLabs TTS with voice cloning</li>
              <li>LiveKit job dispatch and room joining</li>
              <li>End-to-end translation testing (in progress)</li>
              <li>Latency optimization (&lt;2s target)</li>
            </ul>
          </div>

          {/* Phase 3 - Planned */}
          <div className="p-4 rounded-lg bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-purple-900">Phase 3: Advanced Features (Q1 2026)</h3>
              <span className="text-xs font-semibold text-purple-700 px-2 py-1 rounded bg-purple-200">PLANNED</span>
            </div>
            <ul className="space-y-1 text-sm text-purple-800 ml-4 list-disc">
              <li>Custom voice cloning (personalized TTS models)</li>
              <li>Meeting transcripts and summaries</li>
              <li>API for third-party integrations</li>
              <li>Enterprise dashboard and analytics</li>
              <li>Multi-speaker room support (3+ people)</li>
              <li>Mobile apps (iOS + Android)</li>
            </ul>
          </div>

          {/* Phase 4 - Vision */}
          <div className="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-amber-900">Phase 4: Scale & Enterprise (Q2 2026)</h3>
              <span className="text-xs font-semibold text-amber-700 px-2 py-1 rounded bg-amber-200">VISION</span>
            </div>
            <ul className="space-y-1 text-sm text-amber-800 ml-4 list-disc">
              <li>Telephony integration (PSTN, VoIP)</li>
              <li>Video conferencing SDKs (Zoom, Teams, Meet)</li>
              <li>On-premise deployment options</li>
              <li>White-label solutions for enterprises</li>
              <li>AI-powered context learning (improves over time)</li>
              <li>100+ language support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Market Opportunity</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">TAM (Total Addressable Market)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">$56B</p>
            <p className="text-xs text-slate-700 mt-1">Global language services market by 2027</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p className="text-xs font-semibold text-purple-700">SAM (Serviceable Addressable Market)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">$12B</p>
            <p className="text-xs text-slate-700 mt-1">Real-time interpretation and voice tech</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700">SOM (Serviceable Obtainable Market)</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">$600M</p>
            <p className="text-xs text-slate-700 mt-1">Enterprise + SMB focus (5% capture in 5 years)</p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Target Markets</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Enterprise</p>
              <p className="text-xs text-slate-700 mt-1">Global teams, customer support, international sales</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Education</p>
              <p className="text-xs text-slate-700 mt-1">Online courses, international universities, tutoring</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Healthcare</p>
              <p className="text-xs text-slate-700 mt-1">Telemedicine, patient consultations, medical tourism</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Telecoms</p>
              <p className="text-xs text-slate-700 mt-1">International calling, customer service, roaming</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Creators & Gaming</p>
              <p className="text-xs text-slate-700 mt-1">Live streaming, podcasts, multiplayer games</p>
            </div>
            <div className="p-3 rounded-lg border border-black/10 bg-white/50">
              <p className="font-semibold text-sm text-slate-900">Government</p>
              <p className="text-xs text-slate-700 mt-1">Diplomacy, refugee services, public services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Business Model</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">Freemium (B2C)</p>
            <p className="text-xs text-slate-700 mt-2">Free tier: 100 mins/month</p>
            <p className="text-xs text-slate-700">Pro: $19/month (unlimited)</p>
            <p className="text-xs text-slate-700">Teams: $49/user/month</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">Enterprise (B2B)</p>
            <p className="text-xs text-slate-700 mt-2">Custom pricing based on:</p>
            <p className="text-xs text-slate-700">• Minutes used</p>
            <p className="text-xs text-slate-700">• Number of seats</p>
            <p className="text-xs text-slate-700">• SLA requirements</p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">API Access</p>
            <p className="text-xs text-slate-700 mt-2">Pay-per-minute model:</p>
            <p className="text-xs text-slate-700">$0.10/minute (standard)</p>
            <p className="text-xs text-slate-700">Volume discounts available</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Team</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">نــاصـر آل خازم</p>
            <p className="text-sm text-slate-700 mt-1">Founder & CEO</p>
            <p className="text-xs text-slate-600 mt-2">
              Visionary leader with deep expertise in AI-powered communication systems.
              Passionate about breaking down language barriers through technology.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-base text-slate-900">Development Team</p>
            <p className="text-sm text-slate-700 mt-1">Full-Stack Engineers & AI Specialists</p>
            <p className="text-xs text-slate-600 mt-2">
              Experienced team building cutting-edge real-time voice infrastructure with
              LiveKit, Next.js, and advanced AI models.
            </p>
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="rounded-xl border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Investment Opportunity</h2>

        <div className="space-y-3">
          <p className="text-base sm:text-lg text-slate-800">
            We are raising a seed round to accelerate development and bring TRAVoices to market.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-white border border-yellow-300">
              <p className="font-semibold text-sm text-slate-900">Use of Funds</p>
              <ul className="text-xs text-slate-700 mt-2 space-y-1 ml-4 list-disc">
                <li>AI model fine-tuning and optimization</li>
                <li>Infrastructure scaling (LiveKit, cloud)</li>
                <li>Engineering team expansion</li>
                <li>Go-to-market and sales</li>
                <li>Partnership development</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-white border border-yellow-300">
              <p className="font-semibold text-sm text-slate-900">Milestones</p>
              <ul className="text-xs text-slate-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Complete Phase 2 (translation engine)</li>
                <li>10,000+ active users</li>
                <li>5+ enterprise pilot programs</li>
                <li>API launch and developer ecosystem</li>
                <li>Series A readiness (18 months)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          >
            Contact on WhatsApp
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold border-2 border-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 text-slate-900"
          >
            Schedule a Demo
          </a>
        </div>
      </section>

      {/* Social Proof / Traction */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Now?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">Global Workforce</p>
            <p className="text-xs text-slate-700 mt-1">
              Remote work explosion requires seamless cross-border communication
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">AI Maturity</p>
            <p className="text-xs text-slate-700 mt-1">
              STT, translation, and TTS have reached production-grade quality
            </p>
          </div>
          <div className="p-4 rounded-lg border border-black/10 bg-white/50">
            <p className="font-semibold text-sm text-slate-900">WebRTC Infrastructure</p>
            <p className="text-xs text-slate-700 mt-1">
              Real-time communication infrastructure is now commoditized and scalable
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 text-slate-900 px-2 py-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
          Join Us in Breaking Down Language Barriers
        </h2>
        <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto">
          Be part of the team building the universal voice layer for humanity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          >
            Contact Us
          </a>
          <Link
            href="/rooms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold border border-slate-300 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
          >
            Try Live Demo
          </Link>
        </div>
      </section>
    </main>
  )
}

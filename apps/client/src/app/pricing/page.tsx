import Link from "next/link"

export default function PricingPage() {
  return (
    <main className="space-y-12 relative">
      {/* Background motif to match landing */}
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

      {/* Hero */}
      <section className="text-center space-y-5 text-slate-900">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Plans that scale with your thinking</h1>
        <p className="mx-auto max-w-3xl text-lg md:text-xl text-slate-700">
          Value = (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort &amp; Sacrifice). We optimize each lever so you get clarity faster with less friction.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur px-4 py-2 text-sm text-slate-800">
          <span className="font-semibold">30‑day guarantee</span>
          <span aria-hidden>•</span>
          <span>Love it or it’s free. Cancel anytime. Keep your exports.</span>
        </div>
      </section>

      {/* Pricing grid */}
      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {/* Creator Pass (Tripwire) */}
        <PlanCard
          title="Creator Pass"
          pricePrimary="$7/mo"
          priceSecondary="$9 one‑time"
          highlight="Starter • Tripwire"
          ctaHref="/signup?plan=creator"
          ctaLabel="Start with Creator"
          features={[
            '5 maps/month',
            '“AI Map Me” one‑click brain‑dump → map',
            '1 AI persona (Coach)',
            'Export to PDF/PNG',
            '3 premium templates',
            'Community access',
            'Share a map that gets 5 likes → unlock a free month',
          ]}
        />

        {/* Pro Thinker (Featured) */}
        <PlanCard
          title="Pro Thinker"
          pricePrimary="$29/mo"
          badge="Best for individuals"
          featured
          ctaHref="/signup?plan=pro"
          ctaLabel="Go Pro"
          features={[
            'Unlimited maps',
            '3 AI personas (Coach, Strategist, Editor)',
            'Sentiment & cognitive pattern analysis',
            'Export to Notion, Obsidian, Markdown',
            'Personal Timeline View',
            'Weekly Thinking Report',
          ]}
        />

        {/* Team Flow */}
        <PlanCard
          title="Team Flow"
          pricePrimary="$79/mo"
          priceSmall="(3 seats, +$15/extra)"
          badge="For small teams"
          ctaHref="/signup?plan=team"
          ctaLabel="Start Team"
          features={[
            'Everything in Pro',
            'Shared map workspaces',
            'Branch‑level permissions',
            'Commenting, tagging, annotations',
            'Map Merge & Compare',
            'Role‑based AI Co‑Thinking (CEO/Dev/User views)',
          ]}
        />

        {/* Enterprise */}
        <PlanCard
          title="Enterprise Cognition Suite"
          pricePrimary="$299+/mo"
          badge="Custom & scalable"
          ctaHref="/signup?plan=enterprise"
          ctaLabel="Talk to Sales"
          features={[
            'White‑labeling',
            'API access',
            'SSO & SOC2 readiness',
            'Advanced analytics dashboards',
            'Internal coaching templates',
            'Premium onboarding',
          ]}
        />

        {/* Founding Member Pass */}
        <PlanCard
          title="Founding Member Pass"
          pricePrimary="$179 one‑time"
          badge="Limited to first 500"
          ctaHref="/signup?plan=founder"
          ctaLabel="Become a Founder"
          features={[
            'Lifetime access to all future Pro features',
            'Founder badge',
            'Premium support',
            'Your name credited on site (optional)',
          ]}
        />
      </section>

      {/* Value boosters */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-3 text-slate-900">
          <h2 className="text-xl font-bold">Mindshare Challenge</h2>
          <p className="text-slate-800">Map your brain for 7 days and receive an AI‑generated cognitive style report and visual growth timeline.</p>
          <ul className="list-disc pl-5 text-slate-800 space-y-1">
            <li>Share your report with our hashtag</li>
            <li>Earn 1 free month or unlock a premium template</li>
          </ul>
          <div>
            <Link href="/signup?challenge=7day" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30" aria-label="Join the 7-day Mindshare Challenge">
              Join the 7‑day challenge
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-3 text-slate-900">
          <h2 className="text-xl font-bold">Risk‑free by design</h2>
          <ul className="list-disc pl-5 text-slate-800 space-y-1">
            <li>30‑day money‑back guarantee</li>
            <li>Cancel anytime</li>
            <li>Keep all exported files</li>
            <li>Fast onboarding, no learning curve</li>
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center space-y-4 text-slate-900">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to think in maps?</h2>
        <p className="text-slate-700">Start with the Creator Pass or jump straight into Pro. You can upgrade or cancel anytime.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup?plan=pro" className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30" aria-label="Choose Pro plan">
            Get Pro
          </Link>
          <Link href="/signup?plan=creator" className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold border border-black/10 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-white/30" aria-label="Start with Creator plan">
            Start with Creator
          </Link>
        </div>
      </section>
    </main>
  )
}

type PlanCardProps = {
  title: string
  pricePrimary: string
  priceSecondary?: string
  priceSmall?: string
  badge?: string
  highlight?: string
  featured?: boolean
  ctaHref: string
  ctaLabel: string
  features: string[]
}

function PlanCard(props: PlanCardProps) {
  const { title, pricePrimary, priceSecondary, priceSmall, badge, highlight, featured, ctaHref, ctaLabel, features } = props

  const containerClass = featured
    ? "relative rounded-xl border-2 border-amber-500/70 bg-white/80 backdrop-blur p-6 text-slate-900 shadow-[0_10px_30px_rgba(217,119,6,0.25)]"
    : "relative rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 text-slate-900"

  return (
    <div className={containerClass}>
      {badge ? (
        <span className="absolute -top-3 left-4 rounded-full border border-black/10 bg-gradient-to-r from-yellow-300 to-amber-400 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
          {badge}
        </span>
      ) : null}
      {highlight ? (
        <span className="absolute -top-3 right-4 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
          {highlight}
        </span>
      ) : null}

      <div className="space-y-1">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold">{pricePrimary}</span>
          {priceSmall ? (<span className="text-xs text-slate-600">{priceSmall}</span>) : null}
        </div>
        {priceSecondary ? (
          <div className="text-sm text-slate-700">or <span className="font-semibold">{priceSecondary}</span></div>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-800">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Link
          href={ctaHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}



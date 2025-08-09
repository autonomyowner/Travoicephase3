import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vision | NeuroCanvas",
  description:
    "Our moonshot: augment human thought with an AI-native canvas. Investors: see the scale we are building for.",
};

export default function VisionPage() {
  return (
    <div className="relative">
      {/* Full-bleed animated background */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover"
        style={{ backgroundImage: "url('/Brain-Patterns-Illustration.gif')" }}
        aria-hidden
      />
      {/* Dim overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-[1px]" aria-hidden />

      <section className="mx-auto max-w-5xl">
        <header className="pt-6 pb-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Building the thinking layer for the AI age
          </h1>
          <p className="mt-3 text-white/80 max-w-3xl">
            NeuroCanvas turns messy ideas into executable systems. We blend real-time
            reasoning, multimodal capture, and collaborative mind architecture into
            a single canvas. This is not another note app—it is an intelligence
            amplifier.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="rounded-xl border border-white/15 bg-black/40 p-5">
            <h2 className="text-xl font-semibold">Why now</h2>
            <p className="mt-2 text-white/80">
              Models are surpassing interface paradigms. Teams need native AI
              workspaces where thoughts are objects, links are logic, and
              outcomes are computed.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-5">
            <h2 className="text-xl font-semibold">What we ship</h2>
            <ul className="mt-2 space-y-2 text-white/80 list-disc list-inside">
              <li>Real-time voice-to-graph capture</li>
              <li>Reasoning agents that rewire maps into plans</li>
              <li>Executable nodes: docs, APIs, automations</li>
              <li>Org memory that compounds</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-5">
            <h2 className="text-xl font-semibold">Where it goes</h2>
            <p className="mt-2 text-white/80">
              From personal cognition to networked decision markets. The
              operating system for thinking—across founders, researchers,
              and enterprise teams.
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-white/15 bg-gradient-to-br from-black/50 via-black/30 to-black/50 p-6">
          <h3 className="text-2xl md:text-3xl font-bold">The investor offer</h3>
          <p className="mt-3 text-white/85">
            We are opening a small allocation to partners who want asymmetric
            exposure to the tooling layer that every AI-native company will
            require. Funds accelerate: hiring for agentic infra, data
            partnerships, and go-to-market across research labs and startups.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-white/85">
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-sm uppercase tracking-wide text-white/60">Model</div>
              <div className="mt-1 font-semibold">Usage-first SaaS with bottom-up expansion</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-sm uppercase tracking-wide text-white/60">Moat</div>
              <div className="mt-1 font-semibold">Compounding org graphs + execution network effects</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-sm uppercase tracking-wide text-white/60">Timing</div>
              <div className="mt-1 font-semibold">Interface shift to agentic workflows (now)</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-slate-900 bg-gradient-to-r from-yellow-300 to-amber-400 font-medium shadow hover:brightness-105"
            >
              Get early access
            </Link>
            <a
              href="mailto:founders@neurocanvas.ai?subject=NeuroCanvas%20—%20Investor%20Intro"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-white/25 hover:bg-white/10"
            >
              Investor intro
            </a>
          </div>
        </section>

        <footer className="mt-10 pb-2 text-sm text-white/70">
          Built for those who think in systems. Let’s upgrade human agency.
        </footer>
      </section>
    </div>
  );
}


